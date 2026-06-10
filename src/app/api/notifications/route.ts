import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Notification from '@/models/Notification';
import Message from '@/models/Message';
import { getSessionUserId } from '@/lib/server-auth';

export async function GET(req: Request) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get('limit') || 20), 50);

  try {
    await connectDB();

    const [notifications, unreadNotifications, unreadMessages] = await Promise.all([
      Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit),
      Notification.countDocuments({ userId, read: false }),
      Message.countDocuments({ receiver: userId, read: false }),
    ]);

    const unreadByType = notifications.reduce<Record<string, number>>((accumulator, notification) => {
      if (!notification.read) {
        accumulator[notification.type] = (accumulator[notification.type] || 0) + 1;
      }
      return accumulator;
    }, {});

    return NextResponse.json({
      notifications,
      unreadNotifications,
      unreadMessages,
      unreadByType,
      totalUnread: unreadNotifications + unreadMessages,
    });
  } catch (error) {
    console.error('Notifications GET failed:', error);
    return NextResponse.json({ error: 'We could not load your notifications right now.' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const userId = await getSessionUserId(req);
  if (!userId) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const notificationId = typeof body.notificationId === 'string' ? body.notificationId : '';
  const markAll = Boolean(body.markAll);

  try {
    await connectDB();

    if (markAll) {
      await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
      return NextResponse.json({ success: true });
    }

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification id is required.' }, { status: 400 });
    }

    await Notification.updateOne({ _id: notificationId, userId }, { $set: { read: true } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notifications PATCH failed:', error);
    return NextResponse.json({ error: 'We could not update that notification right now.' }, { status: 500 });
  }
}
