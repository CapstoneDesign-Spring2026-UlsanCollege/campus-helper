import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Message from '@/models/Message';
import jwt from 'jsonwebtoken';

function getUserId(req: Request) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if(!token) return null;
  try { return (jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as any).userId; } catch(e) { return null; }
}

export async function GET(req: Request) {
  const userId = getUserId(req);
  if(!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get('targetId');
  if(!targetId) return NextResponse.json({ error: 'Missing target' }, { status: 400 });

  await connectDB();
  const msgs = await Message.find({
    $or: [
      { sender: userId, receiver: targetId },
      { sender: targetId, receiver: userId }
    ]
  }).sort({ createdAt: 1 });
  
  // Auto-mark as read natively
  await Message.updateMany({ sender: targetId, receiver: userId, read: false }, { read: true });

  return NextResponse.json(msgs);
}

export async function POST(req: Request) {
  const userId = getUserId(req);
  if(!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { targetId, content } = await req.json();
  if(!content) return NextResponse.json({ error: 'Empty payload' }, { status: 400 });
  
  await connectDB();
  const doc = await Message.create({ sender: userId, receiver: targetId, content });
  return NextResponse.json(doc);
}
