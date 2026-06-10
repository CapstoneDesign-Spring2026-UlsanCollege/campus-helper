import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Message from '@/models/Message';
import { getSessionUserId } from '@/lib/server-auth';

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

export async function GET(req: Request) {
  const userId = await getSessionUserId(req);
  if(!userId) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });
  
  const { searchParams } = new URL(req.url);
  const targetId = normalizeText(searchParams.get('targetId'));
  if(!targetId) return NextResponse.json({ error: 'A conversation target is required.' }, { status: 400 });

  try {
    await connectDB();
    const msgs = await Message.find({
      $or: [
        { sender: userId, receiver: targetId },
        { sender: targetId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });
    
    await Message.updateMany(
      { sender: targetId, receiver: userId, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json(msgs);
  } catch (error) {
    console.error('Chat GET failed:', error);
    return NextResponse.json({ error: 'We could not load this conversation right now.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getSessionUserId(req);
  if(!userId) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const targetId = normalizeText(body.targetId);
  const content = normalizeText(body.content);

  if(!targetId) return NextResponse.json({ error: 'A conversation target is required.' }, { status: 400 });
  if(!content) return NextResponse.json({ error: 'Please type a message before sending.' }, { status: 400 });
  if(targetId === userId) return NextResponse.json({ error: 'You cannot send a message to yourself.' }, { status: 400 });
  
  try {
    await connectDB();
    const doc = await Message.create({ sender: userId, receiver: targetId, content });
    return NextResponse.json(doc);
  } catch (error) {
    console.error('Chat POST failed:', error);
    return NextResponse.json({ error: 'We could not send that message yet. Please try again.' }, { status: 500 });
  }
}
