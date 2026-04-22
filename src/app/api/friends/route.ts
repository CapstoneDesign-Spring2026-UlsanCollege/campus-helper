import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Friendship from '@/models/Friendship';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

function getUserId(req: Request) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if(!token) return null;
  try { return (jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as jwt.JwtPayload).userId; } catch { return null; }
}

export async function GET(req: Request) {
  const userId = getUserId(req);
  if(!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await connectDB();

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'search') {
    const query = searchParams.get('q') || '';
    const users = await User.find({ 
      name: { $regex: query, $options: 'i' },
      _id: { $ne: userId }
    }, 'name department studentId profilePicture').limit(20);
    return NextResponse.json(users);
  }

  // Aggregate pending requests AND accepted active connections mapping logic
  const pending = await Friendship.find({ recipient: userId, status: 'pending' }).populate('requester', 'name department profilePicture');
  const connections = await Friendship.find({
    $or: [{ requester: userId }, { recipient: userId }],
    status: 'accepted'
  }).populate('requester', 'name department profilePicture').populate('recipient', 'name department profilePicture');

  return NextResponse.json({ pending, connections });
}

export async function POST(req: Request) {
  const userId = getUserId(req);
  if(!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { targetId } = await req.json();
  await connectDB();
  
  const existing = await Friendship.findOne({
    $or: [
       { requester: userId, recipient: targetId },
       { requester: targetId, recipient: userId }
    ]
  });
  if(existing) return NextResponse.json({ error: 'Friendship already exists or pending' }, { status: 400 });

  const doc = await Friendship.create({ requester: userId, recipient: targetId });
  return NextResponse.json(doc);
}

export async function PUT(req: Request) {
  const userId = getUserId(req);
  if(!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { friendshipId, action } = await req.json(); // 'accept' or 'reject'
  await connectDB();

  if (action === 'accept') {
    const doc = await Friendship.findOneAndUpdate({ _id: friendshipId, recipient: userId }, { status: 'accepted' }, { new: true });
    return NextResponse.json(doc);
  } else {
    await Friendship.findOneAndDelete({ _id: friendshipId, recipient: userId });
    return NextResponse.json({ message: 'Rejected connection' });
  }
}
