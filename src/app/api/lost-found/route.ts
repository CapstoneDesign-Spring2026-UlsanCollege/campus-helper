import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import LostItem from '@/models/LostItem';
import jwt from 'jsonwebtoken';
import { getJwtAccessSecret } from '@/lib/env';

function getUserId(req: Request) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  try {
    return (jwt.verify(token, getJwtAccessSecret()) as { userId?: string }).userId || null;
  } catch { return null; }
}

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const filterType = searchParams.get('type');
  
  const query = filterType ? { type: filterType, status: 'active' } : { status: 'active' };
  
  const items = await LostItem.find(query).populate('reportedBy', 'name email department profilePicture').sort({ createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized signal' }, { status: 401 });
  const body = await req.json();
  await connectDB();
  const item = await LostItem.create({ ...body, reportedBy: userId });
  return NextResponse.json(item);
}
