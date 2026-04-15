import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import ChatHistory from '@/models/ChatHistory';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json();

    if (userId) {
      await connectDB();
      await ChatHistory.updateOne(
        { userId },
        { $push: { messages: messages[messages.length - 1] } },
        { upsert: true }
      );
    }

    const result = streamText({
      model: openai('gpt-4o'),
      system: 'You are ULSAN Campus+, a highly advanced AI assistant specialized in IT/Computer science. You help students with their studies, schedules, and note summaries. Reply effectively using Markdown.',
      messages,
      onFinish: async ({ text }) => {
        if (userId) {
          await ChatHistory.updateOne(
             { userId },
             { $push: { messages: { role: 'assistant', content: text } } }
          );
        }
      }
    });

    return result.toTextStreamResponse();
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process AI chat' }, { status: 500 });
  }
}
