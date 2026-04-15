import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Announcement from '@/models/Announcement';
import jwt from 'jsonwebtoken';

function getAdminUserId(req: Request) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'fallback_access_secret'
    ) as { userId?: string; role?: string };

    if (decoded.role !== 'admin' || !decoded.userId) return null;
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { title, content } = await req.json();
    const authorId = getAdminUserId(req);

    if (!authorId) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    await connectDB();
    const doc = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      authorId,
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const posts = await Announcement.find().sort({ createdAt: -1 });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
