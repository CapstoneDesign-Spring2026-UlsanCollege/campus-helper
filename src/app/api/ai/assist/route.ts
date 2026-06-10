import { generateText } from 'ai';
import { NextResponse } from 'next/server';
import { getConfiguredAIModel, getAIErrorMessage } from '@/lib/ai-provider';
import { getSessionUserId } from '@/lib/server-auth';

export const maxDuration = 30;

type AssistMode = 'marketplace' | 'lost-found' | 'note-study-guide';

function safeText(value: unknown, maxLength = 1200) {
  return String(value ?? '').trim().slice(0, maxLength);
}

function parseJsonObject(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function buildPrompt(mode: AssistMode, payload: Record<string, unknown>) {
  if (mode === 'marketplace') {
    return `
You are helping a student publish a trustworthy campus marketplace listing.
Preserve the user's facts. Do not invent accessories, condition, pickup details, or guarantees.
Return JSON only with this shape:
{"title":"short listing title","description":"clear 3-5 sentence listing description"}

Current title: ${safeText(payload.title, 180)}
Current price: ${safeText(payload.price, 80)}
Current description: ${safeText(payload.description)}
`;
  }

  if (mode === 'lost-found') {
    return `
You are helping a student publish a clear lost-and-found campus report.
Preserve facts. Do not invent identifying marks, times, proof, or owner details.
Make it specific enough that another student can respond safely.
Return JSON only with this shape:
{"title":"short report title","description":"clear 3-5 sentence report description"}

Report type: ${safeText(payload.type, 40)}
Current title: ${safeText(payload.title, 180)}
Location: ${safeText(payload.locationFound, 180)}
Current details: ${safeText(payload.description)}
`;
  }

  const style = safeText(payload.style, 80) || 'study-guide';
  const customQuestion = safeText(payload.customQuestion, 500);

  return `
You are helping a student study from a Campus+ note card.
You cannot see the hidden file contents here, so be honest and use only the metadata below.
Create the requested study output style: ${style}.
If a custom question is present, answer it directly using the metadata and clearly say when the file contents are not available.
Return JSON only with this shape:
{"mode":"${style}","confidenceNote":"short note about whether this used metadata only","summary":"concise useful answer","keyTerms":["term 1","term 2","term 3"],"studyQuestions":["question 1","question 2","question 3"],"flashcards":[{"front":"question","back":"answer"}],"quiz":[{"question":"question","answer":"answer"}],"nextSteps":["step 1","step 2"]}

Note title: ${safeText(payload.title, 180)}
Department: ${safeText(payload.department, 180)}
File name: ${safeText(payload.fileName, 220)}
File type: ${safeText(payload.fileType, 120)}
Uploader: ${safeText(payload.uploaderName, 180)}
Custom question: ${customQuestion || 'none'}
`;
}

export async function POST(req: Request) {
  try {
    const userId = await getSessionUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });
    }

    const model = getConfiguredAIModel();
    if (!model) {
      return NextResponse.json(
        { error: 'No AI provider key is configured. Add GEMINI_API_KEY or OPENAI_API_KEY.' },
        { status: 503 }
      );
    }

    const body = await req.json().catch(() => null) as { mode?: AssistMode; payload?: Record<string, unknown> } | null;
    const mode = body?.mode;

    if (mode !== 'marketplace' && mode !== 'lost-found' && mode !== 'note-study-guide') {
      return NextResponse.json({ error: 'Unsupported AI assist mode.' }, { status: 400 });
    }

    const result = await generateText({
      model,
      system: 'You are Ulsan Campus+ AI. Be concise, practical, student-safe, and factual. Return valid JSON when asked.',
      prompt: buildPrompt(mode, body?.payload || {}),
    });

    const parsed = parseJsonObject(result.text);
    if (!parsed || typeof parsed !== 'object') {
      return NextResponse.json({ error: 'AI returned an unreadable response. Please try again.' }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('AI assist failed:', error);
    return NextResponse.json({ error: getAIErrorMessage(error) }, { status: 500 });
  }
}
