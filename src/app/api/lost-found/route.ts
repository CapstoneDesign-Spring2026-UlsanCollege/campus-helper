import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import LostItem from '@/models/LostItem';
import { getSessionUserId } from '@/lib/server-auth';

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get('type');
    const filterStatus = searchParams.get('status');
    const textQuery = normalizeText(searchParams.get('query')).slice(0, 80);

    await connectDB();
    const query: Record<string, unknown> = {};
    if (filterType === 'lost' || filterType === 'found') {
      query.type = filterType;
    }
    if (filterStatus === 'active' || filterStatus === 'resolved') {
      query.status = filterStatus;
    }
    if (textQuery) {
      query.$or = [
        { title: { $regex: textQuery, $options: 'i' } },
        { description: { $regex: textQuery, $options: 'i' } },
        { locationFound: { $regex: textQuery, $options: 'i' } },
      ];
    }

    const items = await LostItem.find(query)
      .populate('reportedBy', 'name email department profilePicture')
      .sort({ createdAt: -1 });
    return NextResponse.json(items);
  } catch (error) {
    console.error('Lost and found GET failed:', error);
    return NextResponse.json({ error: 'Failed to load lost and found posts.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });

  try {
    const body = await req.json();
    const title = normalizeText(body.title);
    const description = normalizeText(body.description);
    const locationFound = normalizeText(body.locationFound);
    const type = body.type === 'found' ? 'found' : 'lost';
    const imageUrls = Array.isArray(body.imageUrls)
      ? body.imageUrls.filter((url: unknown) => typeof url === 'string' && url.trim()).map((url: string) => url.trim())
      : [];

    if (!title || !description || !locationFound) {
      return NextResponse.json({ error: 'Please enter a title, description, and location.' }, { status: 400 });
    }

    await connectDB();
    const item = await LostItem.create({ title, description, locationFound, type, imageUrls, reportedBy: userId });
    const populatedItem = await LostItem.findById(item._id).populate('reportedBy', 'name email department profilePicture');
    return NextResponse.json(populatedItem, { status: 201 });
  } catch (error) {
    console.error('Lost and found POST failed:', error);
    return NextResponse.json({ error: 'Failed to submit post. Please try again.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const id = normalizeText(body._id);
    const status = body.status === 'resolved' ? 'resolved' : body.status === 'active' ? 'active' : '';

    if (!id || !status) {
      return NextResponse.json({ error: 'A valid item and status are required.' }, { status: 400 });
    }

    await connectDB();
    const item = await LostItem.findById(id);
    if (!item) return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    if (item.reportedBy.toString() !== userId) {
      return NextResponse.json({ error: 'You can only update your own post.' }, { status: 403 });
    }

    item.status = status;
    await item.save();

    const populatedItem = await LostItem.findById(item._id).populate('reportedBy', 'name email department profilePicture');
    return NextResponse.json(populatedItem);
  } catch (error) {
    console.error('Lost and found PATCH failed:', error);
    return NextResponse.json({ error: 'Failed to update this post.' }, { status: 500 });
  }
}
