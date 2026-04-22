import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { openai } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import ChatHistory from '@/models/ChatHistory';
import jwt from 'jsonwebtoken';

export const maxDuration = 30;

function getUserId(req: Request, fallback?: string) {
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (token) {
    try {
      return (jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { userId?: string }).userId || fallback;
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

function getAIErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('insufficient_quota') || message.toLowerCase().includes('quota')) {
    return 'The AI assistant is connected, but the configured AI provider has no available quota. Please check billing, usage limits, or use a key from a project with available credits.';
  }

  if (message.toLowerCase().includes('api key')) {
    return 'The AI assistant could not authenticate with the configured AI provider. Please check GEMINI_API_KEY or OPENAI_API_KEY in .env.local.';
  }

  return 'The AI assistant could not complete the response. Please try again in a moment.';
}

function getConfiguredModel() {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (geminiKey) {
    const google = createGoogleGenerativeAI({ apiKey: geminiKey });
    return google('gemini-2.5-flash');
  }

  if (process.env.OPENAI_API_KEY) {
    return openai('gpt-4o');
  }

  return null;
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

    return NextResponse.json({
      messages: history?.messages?.length ? history.messages : [welcomeMessage],
    });
  } catch (error) {
    console.error('AI history load failed:', error);
    return NextResponse.json({ messages: [welcomeMessage] });
  }
}

export async function POST(req: Request) {
  try {
    const model = getConfiguredModel();

    if (!model) {
      return NextResponse.json(
        { error: 'No AI provider key is configured. Add GEMINI_API_KEY or OPENAI_API_KEY in .env.local.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const messages = (body.messages || []) as UIMessage[];
    const userId = getUserId(req, body.userId);

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const result = streamText({
      model,
      system: 'You are ULSAN Campus+, a practical AI assistant for Ulsan University students. Be concise, helpful, and student-friendly. Help with computer science, study planning, schedules, notes, marketplace posts, and campus questions. Use Markdown when it improves readability.',
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onError: getAIErrorMessage,
      onFinish: async ({ messages: finishedMessages }) => {
        if (userId && userId !== 'anonymous') {
          try {
            await connectDB();
            await ChatHistory.updateOne(
              { userId },
              { $set: { messages: finishedMessages } },
              { upsert: true }
            );
          } catch (error) {
            console.error('AI history save failed:', error);
          }
        }
      },
    });
  } catch (error) {
    console.error('AI chat failed:', error);
    return NextResponse.json({ error: 'Failed to process AI chat' }, { status: 500 });
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
