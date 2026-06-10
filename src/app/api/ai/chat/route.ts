import { createUIMessageStream, createUIMessageStreamResponse, generateText, type ModelMessage, type UIMessage } from 'ai';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import ChatHistory from '@/models/ChatHistory';
import LostItem from '@/models/LostItem';
import MarketItem from '@/models/MarketItem';
import Note from '@/models/Note';
import '@/models/User';
import jwt from 'jsonwebtoken';
import { getJwtAccessSecret } from '@/lib/env';
import { getAIErrorMessage, getConfiguredAIModels } from '@/lib/ai-provider';

export const maxDuration = 30;

function getUserId(req: Request, fallback?: string) {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (token) {
    try {
      return (jwt.verify(token, getJwtAccessSecret()) as { userId?: string }).userId || fallback;
    } catch {
      return fallback;
    }
  }

  return fallback;
}

const welcomeMessage: UIMessage = {
  id: 'welcome',
  role: 'assistant',
  parts: [
    {
      type: 'text',
      text: 'Hello. I am your Ulsan Campus+ assistant. Ask me about classes, notes, schedules, campus life, or upload a file for analysis.',
    },
  ],
};

function getMessageText(message: UIMessage) {
  return message.parts
    ?.map((part) => (part.type === 'text' ? part.text : ''))
    .filter(Boolean)
    .join('\n')
    .trim() || '';
}

function getLatestUserText(messages: UIMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index]?.role === 'user') {
      return getMessageText(messages[index]);
    }
  }

  return '';
}

function toSafeModelMessages(messages: UIMessage[]): ModelMessage[] {
  const modelMessages: ModelMessage[] = [];

  for (const message of messages) {
    const text = getMessageText(message);
    if (!text) continue;

    if (message.role === 'user') {
      modelMessages.push({ role: 'user', content: text });
    } else if (message.role === 'assistant') {
      modelMessages.push({ role: 'assistant', content: text });
    }
  }

  return modelMessages;
}

function createAssistantMessage(text: string): UIMessage {
  return {
    id: `assistant-${Date.now()}`,
    role: 'assistant',
    parts: [{ type: 'text', text }],
  };
}

function toSafeUIMessages(messages: UIMessage[]): UIMessage[] {
  const safeMessages: UIMessage[] = [];

  messages.forEach((message, index) => {
    const text = getMessageText(message);
    if (!text || (message.role !== 'user' && message.role !== 'assistant')) return;

    safeMessages.push({
        id: typeof message.id === 'string' && message.id ? message.id : `${message.role}-${index}-${Date.now()}`,
        role: message.role,
        parts: [{ type: 'text' as const, text }],
    });
  });

  return safeMessages;
}

async function persistAIHistory(userId: string | undefined, messages: UIMessage[]) {
  if (!userId || userId === 'anonymous') return;

  try {
    await connectDB();
    await ChatHistory.updateOne(
      { userId },
      { $set: { messages } },
      { upsert: true }
    );
  } catch (error) {
    console.error('AI history save failed:', error);
  }
}

function streamPlainAssistantMessage(message: UIMessage, allMessages: UIMessage[], userId?: string) {
  const text = getMessageText(message);
  const partId = `text-${Date.now()}`;

  const stream = createUIMessageStream<UIMessage>({
    execute: ({ writer }) => {
      writer.write({ type: 'start', messageId: message.id });
      writer.write({ type: 'text-start', id: partId });
      writer.write({ type: 'text-delta', id: partId, delta: text });
      writer.write({ type: 'text-end', id: partId });
      writer.write({ type: 'finish', finishReason: 'stop' });
    },
    onFinish: async () => {
      await persistAIHistory(userId, allMessages);
    },
  });

  return createUIMessageStreamResponse({ stream });
}

function buildProviderFailureResponse(latestText: string, campusContext: string, failures: string[]) {
  const contextHint = campusContext
    ? `\n\nI did still check the Campus+ database context for your question:\n${campusContext
        .replace('Campus+ live database context for this question:', '')
        .trim()}`
    : '';

  return [
    'The AI model connection is currently blocked by provider settings, but the Campus+ app is working.',
    '',
    'What I found:',
    ...failures.map((failure) => `- ${failure}`),
    '',
    'How to fix it:',
    '- Add a Gemini key with available quota, or remove the over-quota Gemini key.',
    '- Add a valid OpenAI key with available credits, or replace the invalid OpenAI key.',
    '- Restart the dev server or redeploy after changing environment variables.',
    latestText ? `\nYour question was: "${latestText}"` : '',
    contextHint,
  ].filter(Boolean).join('\n');
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getSearchTerms(question: string) {
  const stopWords = new Set([
    'about',
    'after',
    'again',
    'campus',
    'could',
    'find',
    'from',
    'give',
    'have',
    'item',
    'items',
    'listing',
    'listings',
    'lost',
    'found',
    'market',
    'marketplace',
    'note',
    'notes',
    'please',
    'post',
    'posts',
    'show',
    'that',
    'the',
    'this',
    'what',
    'where',
    'with',
    'ulsan',
  ]);

  return Array.from(
    new Set(
      question
        .toLowerCase()
        .split(/[^a-z0-9]+/i)
        .map((word) => word.trim())
        .filter((word) => word.length >= 3 && !stopWords.has(word))
    )
  ).slice(0, 6);
}

function buildTextQuery(question: string, fields: string[]) {
  const terms = getSearchTerms(question);
  if (terms.length === 0) return {};

  const regexes = terms.map((term) => new RegExp(escapeRegex(term), 'i'));
  return {
    $or: fields.flatMap((field) => regexes.map((regex) => ({ [field]: regex }))),
  };
}

function shouldSearch(question: string, keywords: string[]) {
  const lower = question.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword));
}

function formatDate(value?: Date | string) {
  if (!value) return 'unknown date';
  return new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

type PopulatedUser = {
  _id?: unknown;
  name?: string;
  department?: string;
  profilePicture?: string;
};

type MarketContextItem = {
  _id?: unknown;
  title?: string;
  description?: string;
  price?: number;
  status?: string;
  createdAt?: Date;
  sellerId?: PopulatedUser;
};

type LostContextItem = {
  _id?: unknown;
  title?: string;
  description?: string;
  locationFound?: string;
  type?: string;
  status?: string;
  createdAt?: Date;
  reportedBy?: PopulatedUser;
};

type NoteContextItem = {
  _id?: unknown;
  title?: string;
  department?: string;
  fileName?: string;
  fileType?: string;
  createdAt?: Date;
  uploadedBy?: PopulatedUser;
  likes?: unknown[];
};

function objectIdToString(value: unknown) {
  if (!value) return '';
  return typeof value === 'string' ? value : String(value);
}

function buildChatLink(peer: PopulatedUser | undefined, context: 'market' | 'lost-found' | 'notes', draft: string) {
  const userId = objectIdToString(peer?._id);
  if (!userId) return '';

  const params = new URLSearchParams({
    userId,
    name: peer?.name || 'Campus user',
    context,
    draft,
  });

  if (peer?.department) params.set('department', peer.department);
  if (peer?.profilePicture) params.set('profilePicture', peer.profilePicture);

  return `/dashboard/chat?${params.toString()}`;
}

function buildMarketplaceQuery(question: string) {
  const lower = question.toLowerCase();
  const query: Record<string, unknown> = {
    ...buildTextQuery(question, ['title', 'description']),
  };

  if (lower.includes('sold')) {
    query.status = 'sold';
  } else if (!lower.includes('all marketplace') && !lower.includes('all listings')) {
    query.status = 'available';
  }

  return query;
}

function buildLostFoundQuery(question: string) {
  const lower = question.toLowerCase();
  const query: Record<string, unknown> = {
    ...buildTextQuery(question, ['title', 'description', 'locationFound', 'type']),
  };

  if (lower.includes('resolved') || lower.includes('returned') || lower.includes('closed')) {
    query.status = 'resolved';
  } else if (!lower.includes('all lost') && !lower.includes('all found')) {
    query.status = 'active';
  }

  const hasLost = lower.includes('lost') || lower.includes('missing');
  const hasFound = lower.includes('found');
  if (hasLost && !hasFound) query.type = 'lost';
  if (hasFound && !hasLost) query.type = 'found';

  return query;
}

async function buildCampusDataContext(question: string) {
  const wantsMarketplace = shouldSearch(question, ['market', 'marketplace', 'listing', 'listining', 'buy', 'sell', 'price', 'available']);
  const wantsNotes = shouldSearch(question, ['note', 'notes', 'study', 'pdf', 'file', 'lecture', 'download']);
  const wantsLostFound = shouldSearch(question, ['lost', 'found', 'fine', 'missing', 'wallet', 'id card', 'item']);
  const wantsEverything = shouldSearch(question, ['everything', 'all', 'campus data', 'available resources']);

  if (!wantsMarketplace && !wantsNotes && !wantsLostFound && !wantsEverything) {
    return '';
  }

  await connectDB();

  const sections: string[] = [];
  const lower = question.toLowerCase();

  if (wantsMarketplace || wantsEverything) {
    const query = buildMarketplaceQuery(question);
    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (lower.includes('cheap') || lower.includes('budget') || lower.includes('low price')) {
      sort = { price: 1, createdAt: -1 };
    } else if (lower.includes('expensive') || lower.includes('highest price')) {
      sort = { price: -1, createdAt: -1 };
    }

    const [items, total] = await Promise.all([
      MarketItem.find(query)
        .sort(sort)
        .limit(6)
        .populate('sellerId', 'name department profilePicture')
        .lean<MarketContextItem[]>(),
      MarketItem.countDocuments(query),
    ]);

    const marketLines = items
      .map((item, index) => {
        const seller = item.sellerId?.name ? ` Seller: ${item.sellerId.name}${item.sellerId.department ? ` (${item.sellerId.department})` : ''}.` : '';
        const chatLink = buildChatLink(
          item.sellerId,
          'market',
          `Hi, I'm interested in "${item.title || 'your listing'}". Is it still available?`
        );
        const action = chatLink ? ` Action: [message seller](${chatLink}).` : ' Action: open /dashboard/market.';
        return `${index + 1}. ${item.title || 'Untitled'} - ${item.price ?? 0}. Status: ${item.status || 'available'}. Posted: ${formatDate(item.createdAt)}.${seller} Details: ${item.description || 'No description.'}${action}`;
      })
      .join('\n');

    sections.push(
      `Marketplace results (${items.length} shown / ${total} matching):\n${marketLines || 'No matching marketplace listings found.'}\nOpen page: /dashboard/market`
    );
  }

  if (wantsNotes || wantsEverything) {
    const query = buildTextQuery(question, ['title', 'department', 'fileName', 'fileType']);
    const [notesRaw, total] = await Promise.all([
      Note.find(query)
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('uploadedBy', 'name department profilePicture')
        .lean<NoteContextItem[]>(),
      Note.countDocuments(query),
    ]);

    const notes = lower.includes('popular') || lower.includes('best') || lower.includes('liked')
      ? [...notesRaw].sort((a, b) => (Array.isArray(b.likes) ? b.likes.length : 0) - (Array.isArray(a.likes) ? a.likes.length : 0))
      : notesRaw;

    const noteLines = notes
      .map((note, index) => {
        const id = objectIdToString(note._id);
        const uploader = note.uploadedBy?.name ? ` Uploader: ${note.uploadedBy.name}${note.uploadedBy.department ? ` (${note.uploadedBy.department})` : ''}.` : '';
        const likes = Array.isArray(note.likes) ? note.likes.length : 0;
        const download = id ? ` Download: /api/notes/${id}/download.` : '';
        const chatLink = buildChatLink(
          note.uploadedBy,
          'notes',
          `Hi, I saw your note "${note.title || 'study file'}". Can I ask a question about it?`
        );
        const action = chatLink ? ` Action: [message uploader](${chatLink}).` : ' Action: open /dashboard/notes.';
        return `${index + 1}. ${note.title || 'Untitled'} - ${note.department || 'General'}. File: ${note.fileName || note.fileType || 'study file'}. Uploaded: ${formatDate(note.createdAt)}. Likes: ${likes}.${uploader}${download}${action}`;
      })
      .join('\n');

    sections.push(
      `Notes results (${notes.length} shown / ${total} matching):\n${noteLines || 'No matching notes found.'}\nOpen page: /dashboard/notes`
    );
  }

  if (wantsLostFound || wantsEverything) {
    const query = buildLostFoundQuery(question);
    const [items, total] = await Promise.all([
      LostItem.find(query)
        .sort({ createdAt: -1 })
        .limit(6)
        .populate('reportedBy', 'name department profilePicture')
        .lean<LostContextItem[]>(),
      LostItem.countDocuments(query),
    ]);

    const lostFoundLines = items
      .map((item, index) => {
        const reporter = item.reportedBy?.name ? ` Reporter: ${item.reportedBy.name}${item.reportedBy.department ? ` (${item.reportedBy.department})` : ''}.` : '';
        const chatLink = buildChatLink(
          item.reportedBy,
          'lost-found',
          `Hi, I'm contacting you about "${item.title || 'your lost and found post'}". Is this still active?`
        );
        const action = chatLink ? ` Action: [message reporter](${chatLink}).` : ' Action: open /dashboard/lost-found.';
        return `${index + 1}. ${item.title || 'Untitled'} - ${item.type || 'item'} at ${item.locationFound || 'unknown location'}. Status: ${item.status || 'active'}. Posted: ${formatDate(item.createdAt)}.${reporter} Details: ${item.description || 'No description.'}${action}`;
      })
      .join('\n');

    sections.push(
      `Lost and Found results (${items.length} shown / ${total} matching):\n${lostFoundLines || 'No matching lost and found posts found.'}\nOpen page: /dashboard/lost-found`
    );
  }

  return sections.length
    ? `\n\nCampus+ live database context for this question:\n${sections.join('\n\n')}\n\nUse these real results when answering. Prefer compact bullet lists. Include useful action links exactly as provided when relevant. If there are no matches, say so clearly and suggest where the user can search or post. Do not invent listings, notes, or lost-and-found posts.`
    : '';
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = getUserId(req, searchParams.get('userId') || undefined);

    if (!userId || userId === 'anonymous') {
      return NextResponse.json({ messages: [welcomeMessage] });
    }

    await connectDB();
    const history = await ChatHistory.findOne({ userId }).lean();
    const safeMessages = Array.isArray(history?.messages)
      ? toSafeUIMessages(history.messages as UIMessage[])
      : [];

    return NextResponse.json({
      messages: safeMessages.length ? safeMessages : [welcomeMessage],
    });
  } catch (error) {
    console.error('AI history load failed:', error);
    return NextResponse.json({ messages: [welcomeMessage] });
  }
}

export async function POST(req: Request) {
  try {
    const configuredModels = getConfiguredAIModels();

    if (configuredModels.length === 0) {
      return NextResponse.json(
        { error: 'No AI provider key is configured. Add GEMINI_API_KEY or OPENAI_API_KEY in .env.local.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const messages = toSafeUIMessages((body.messages || []) as UIMessage[]);
    const userId = getUserId(req, body.userId);

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const campusContext = await buildCampusDataContext(getLatestUserText(messages));
    const system = `You are ULSAN Campus+, a practical AI assistant for Ulsan University students. Be concise, helpful, and student-friendly. Help with computer science, study planning, schedules, notes, marketplace posts, and campus questions. Use Markdown when it improves readability.

When the user asks about marketplace listings, notes, or lost-and-found items, answer from the live Campus+ database context provided below. Include the most relevant items as a short list with title, useful metadata, and the app page path. If the context says no matches, do not invent results.${campusContext}`;
    const modelMessages = toSafeModelMessages(messages);
    if (modelMessages.length === 0) {
      return NextResponse.json({ error: 'No readable message text provided' }, { status: 400 });
    }
    const failures: string[] = [];

    for (const configured of configuredModels) {
      try {
        const result = await generateText({
          model: configured.model,
          system,
          messages: modelMessages,
        });
        const assistantMessage = createAssistantMessage(result.text);
        return streamPlainAssistantMessage(assistantMessage, [...messages, assistantMessage], userId);
      } catch (error) {
        failures.push(`${configured.name}: ${getAIErrorMessage(error)}`);
        console.error(`${configured.name} AI generation failed:`, error);
      }
    }

    const assistantMessage = createAssistantMessage(
      buildProviderFailureResponse(getLatestUserText(messages), campusContext, failures)
    );
    return streamPlainAssistantMessage(assistantMessage, [...messages, assistantMessage], userId);
  } catch (error) {
    console.error('AI chat failed:', error);
    return NextResponse.json({ error: getAIErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = getUserId(req, searchParams.get('userId') || undefined);

    if (!userId || userId === 'anonymous') {
      return NextResponse.json({ ok: true });
    }

    await connectDB();
    await ChatHistory.updateOne({ userId }, { $set: { messages: [] } }, { upsert: true });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('AI history clear failed:', error);
    return NextResponse.json({ error: 'Failed to clear AI history' }, { status: 500 });
  }
}
