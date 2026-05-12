import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Announcement from '@/models/Announcement';
import User from '@/models/User';
import { createNotifications } from '@/lib/notifications';
import jwt from 'jsonwebtoken';
import { getJwtAccessSecret } from '@/lib/env';

function getAdminUserId(req: Request) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(
      token,
      getJwtAccessSecret()
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

    const recipients = await User.find({ _id: { $ne: authorId } }, '_id').lean();
    await createNotifications(
      recipients.map((user) => ({
        userId: String(user._id),
        type: 'announcement',
        title: `New announcement: ${title.trim()}`,
        body: content.trim().slice(0, 140),
        link: '/dashboard/notifications',
      }))
    );

    return NextResponse.json(doc, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const posts = await Announcement.find().sort({ createdAt: -1 });
    return NextResponse.json(posts);
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
