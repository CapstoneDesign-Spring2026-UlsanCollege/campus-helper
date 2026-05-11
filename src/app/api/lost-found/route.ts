import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import LostItem from '@/models/LostItem';
import jwt from 'jsonwebtoken';
import { getJwtAccessSecret } from '@/lib/env';

function getUserId(req: Request) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, getJwtAccessSecret()) as { userId?: string; id?: string };
    return payload.userId || payload.id || null;
  } catch { return null; }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get('type');
    const query = filterType ? { type: filterType, status: 'active' } : { status: 'active' };
    const items = await LostItem.find(query).populate('reportedBy', 'name email department profilePicture').sort({ createdAt: -1 });
    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: 'Failed to load lost and found posts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });

  try {
    const body = await req.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const locationFound = typeof body.locationFound === 'string' ? body.locationFound.trim() : '';
    const type = body.type === 'found' ? 'found' : 'lost';
    const imageUrls = Array.isArray(body.imageUrls)
      ? body.imageUrls.filter((url: unknown) => typeof url === 'string' && url.trim()).map((url: string) => url.trim())
      : [];

    if (!title || !description || !locationFound) {
      return NextResponse.json({ error: 'Please enter a title, description, and location.' }, { status: 400 });
    }

    await connectDB();
    const item = await LostItem.create({ title, description, locationFound, type, imageUrls, reportedBy: userId });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Failed to submit post. Please try again.' }, { status: 500 });
  }
}
