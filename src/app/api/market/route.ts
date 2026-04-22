import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import MarketItem from '@/models/MarketItem';
import jwt from 'jsonwebtoken';

function getUserId(req: Request) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'fallback_access_secret') as { userId?: string; id?: string };
    return payload.userId || payload.id || null;
  } catch { return null; }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const items = await MarketItem.find({ status: 'available' }).populate('sellerId', 'name email department profilePicture').sort({ createdAt: -1 });
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: 'Failed to load marketplace listings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });

  try {
    const body = await req.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const price = Number(body.price);
    const imageUrls = Array.isArray(body.imageUrls)
      ? body.imageUrls.filter((url: unknown) => typeof url === 'string' && url.trim()).map((url: string) => url.trim())
      : [];

    if (!title || !description || Number.isNaN(price) || price < 0) {
      return NextResponse.json({ error: 'Please enter a title, description, and valid price.' }, { status: 400 });
    }

    await connectDB();
    const item = await MarketItem.create({ title, description, price, imageUrls, sellerId: userId });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Failed to publish listing. Please try again.' }, { status: 500 });
  }
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
