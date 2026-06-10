import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Announcement from '@/models/Announcement';
import User from '@/models/User';
import { createNotifications } from '@/lib/notifications';
import { getAdminUserId } from '@/lib/admin-auth';

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

const PRIORITY_ORDER = {
  urgent: 0,
  important: 1,
  normal: 2,
} as const;

function parseOptionalDate(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function sortAnnouncements<T extends { pinned?: boolean; priority?: string; publishAt?: string | Date; createdAt?: string | Date }>(items: T[]) {
  return [...items].sort((a, b) => {
    if (Boolean(a.pinned) !== Boolean(b.pinned)) return a.pinned ? -1 : 1;
    const priorityDiff =
      (PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] ?? PRIORITY_ORDER.normal) -
      (PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] ?? PRIORITY_ORDER.normal);
    if (priorityDiff !== 0) return priorityDiff;

    const aPublish = a.publishAt ? new Date(a.publishAt).getTime() : 0;
    const bPublish = b.publishAt ? new Date(b.publishAt).getTime() : 0;
    if (aPublish !== bPublish) return bPublish - aPublish;

    const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bCreated - aCreated;
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const title = normalizeText(body.title);
    const content = normalizeText(body.content);
    const priority = body.priority === 'urgent' ? 'urgent' : body.priority === 'important' ? 'important' : 'normal';
    const pinned = Boolean(body.pinned);
    const publishAt = parseOptionalDate(body.publishAt);
    const expiresAt = parseOptionalDate(body.expiresAt);
    const authorId = getAdminUserId(req);

    if (!authorId) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required.' }, { status: 400 });
    }
    if (publishAt && expiresAt && publishAt.getTime() >= expiresAt.getTime()) {
      return NextResponse.json({ error: 'Expiry must be later than the publish time.' }, { status: 400 });
    }

    await connectDB();
    const doc = await Announcement.create({
      title,
      content,
      authorId,
      priority,
      pinned,
      publishAt,
      expiresAt,
    });

    if (!publishAt || publishAt.getTime() <= Date.now()) {
      const recipients = await User.find({ _id: { $ne: authorId } }, '_id').lean();
      await createNotifications(
        recipients.map((user) => ({
          userId: String(user._id),
          type: 'announcement',
          title: `New announcement: ${title}`,
          body: content.slice(0, 140),
          link: '/dashboard/notifications',
        }))
      );
    }

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error('Admin announcement POST failed:', error);
    return NextResponse.json({ error: 'We could not publish that notice right now.' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope');
    const now = new Date();
    const isAdminScope = scope === 'admin' && Boolean(getAdminUserId(req));
    const query = isAdminScope
      ? {}
      : {
          $and: [
            {
              $or: [{ publishAt: { $exists: false } }, { publishAt: null }, { publishAt: { $lte: now } }],
            },
            {
              $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }],
            },
          ],
        };
    const posts = await Announcement.find(query)
      .populate('authorId', 'name')
      .lean();
    return NextResponse.json(sortAnnouncements(posts));
  } catch (error) {
    console.error('Admin announcement GET failed:', error);
    return NextResponse.json({ error: 'We could not load notices right now.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const adminId = getAdminUserId(req);
    if (!adminId) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Announcement ID is required.' }, { status: 400 });
    }

    await connectDB();
    await Announcement.deleteOne({ _id: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin announcement DELETE failed:', error);
    return NextResponse.json({ error: 'We could not delete that notice right now.' }, { status: 500 });
  }
}
