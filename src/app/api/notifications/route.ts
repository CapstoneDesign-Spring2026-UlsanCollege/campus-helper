import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Notification from '@/models/Notification';
import Message from '@/models/Message';
import jwt from 'jsonwebtoken';
import { getJwtAccessSecret } from '@/lib/env';

function getUserId(req: Request) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, getJwtAccessSecret()) as { userId?: string; id?: string };
    return payload.userId || payload.id || null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get('limit') || 20), 50);

  await connectDB();

  const [notifications, unreadNotifications, unreadMessages] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit),
    Notification.countDocuments({ userId, read: false }),
    Message.countDocuments({ receiver: userId, read: false }),
  ]);

  return NextResponse.json({
    notifications,
    unreadNotifications,
    unreadMessages,
    totalUnread: unreadNotifications + unreadMessages,
  });
}

export async function PATCH(req: Request) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const notificationId = typeof body.notificationId === 'string' ? body.notificationId : '';
  const markAll = Boolean(body.markAll);

  await connectDB();

  if (markAll) {
    await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
    return NextResponse.json({ success: true });
  }

  if (!notificationId) {
    return NextResponse.json({ error: 'Notification id is required' }, { status: 400 });
  }

  await Notification.updateOne({ _id: notificationId, userId }, { $set: { read: true } });
  return NextResponse.json({ success: true });
}
