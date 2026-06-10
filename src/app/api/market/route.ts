import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import MarketItem from '@/models/MarketItem';
import { getSessionUserId } from '@/lib/server-auth';

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

function readStatus(value: unknown) {
  return value === 'sold' ? 'sold' : 'available';
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = normalizeText(searchParams.get('query')).slice(0, 80);
    const statusFilter = searchParams.get('status');

    await connectDB();
    const mongoQuery: Record<string, unknown> = {};

    if (statusFilter === 'available' || statusFilter === 'sold') {
      mongoQuery.status = statusFilter;
    }

    if (query) {
      mongoQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    const items = await MarketItem.find(mongoQuery)
      .populate('sellerId', 'name email department profilePicture')
      .sort({ createdAt: -1 });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Marketplace GET error:', error);
    return NextResponse.json({ error: 'Failed to load marketplace listings.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });

  try {
    const body = await req.json();
    const title = normalizeText(body.title);
    const description = normalizeText(body.description);
    const price = Number(body.price);
    const imageUrls = Array.isArray(body.imageUrls)
      ? body.imageUrls.filter((url: unknown) => typeof url === 'string' && url.trim()).map((url: string) => url.trim())
      : [];

    if (!title || !description || Number.isNaN(price) || price < 0) {
      return NextResponse.json({ error: 'Please enter a title, description, and valid price.' }, { status: 400 });
    }

    await connectDB();
    const item = await MarketItem.create({ title, description, price, imageUrls, sellerId: userId });
    const populatedItem = await MarketItem.findById(item._id).populate('sellerId', 'name email department profilePicture');
    return NextResponse.json(populatedItem, { status: 201 });
  } catch (error) {
    console.error('Marketplace create error:', error);
    return NextResponse.json({ error: 'Failed to publish listing. Please try again.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });

    await connectDB();
    const item = await MarketItem.findOne({ _id: id });
    if (!item) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    if (item.sellerId.toString() !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await MarketItem.deleteOne({ _id: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Marketplace delete error:', error);
    return NextResponse.json({ error: 'Failed to delete listing. Please try again.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });

  try {
    const body = await req.json();
    const { _id } = body;
    if (!_id) return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });

    const title = normalizeText(body.title);
    const description = normalizeText(body.description);
    const price = Number(body.price);
    const status = readStatus(body.status);

    if (!title || !description || Number.isNaN(price) || price < 0) {
      return NextResponse.json({ error: 'Please enter a title, description, and valid price.' }, { status: 400 });
    }

    await connectDB();
    const item = await MarketItem.findOne({ _id });
    if (!item) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    if (item.sellerId.toString() !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    Object.assign(item, { title, description, price, status });
    await item.save();

    const populatedItem = await MarketItem.findById(item._id).populate('sellerId', 'name email department profilePicture');
    return NextResponse.json(populatedItem);
  } catch (error) {
    console.error('Marketplace update error:', error);
    return NextResponse.json({ error: 'Failed to update listing. Please try again.' }, { status: 500 });
  }
}
