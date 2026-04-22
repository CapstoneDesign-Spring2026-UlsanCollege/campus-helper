import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import MarketItem from '@/models/MarketItem';
import jwt from 'jsonwebtoken';

function getUserId(req: Request) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  try {
    return (jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as { userId: string }).userId;
  } catch(e) { return null; }
}

export async function GET(req: Request) {
  await connectDB();
  const items = await MarketItem.find({ status: 'available' }).populate('sellerId', 'name email department profilePicture').sort({ createdAt: -1 });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const body = await req.json();
  await connectDB();
  const item = await MarketItem.create({ ...body, sellerId: userId });
  return NextResponse.json(item);
}

export async function DELETE(req: Request) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });

  await connectDB();
  const item = await MarketItem.findOne({ _id: id });
  if (!item) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  if (item.sellerId.toString() !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await MarketItem.deleteOne({ _id: id });
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { _id, ...updates } = body;
  if (!_id) return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });

  await connectDB();
  const item = await MarketItem.findOne({ _id });
  if (!item) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  if (item.sellerId.toString() !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  Object.assign(item, updates);
  await item.save();

  return NextResponse.json(item);
}
