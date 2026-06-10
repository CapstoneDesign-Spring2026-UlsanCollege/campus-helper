import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongoose';
import Friendship from '@/models/Friendship';
import Message from '@/models/Message';
import User from '@/models/User';
import { getSessionUserId } from '@/lib/server-auth';

type ContactSource = 'friend' | 'message';

type ChatContact = {
  _id: string;
  name: string;
  department?: string;
  profilePicture?: string;
  source: ContactSource;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount?: number;
};

type PopulatedPeer = {
  _id: mongoose.Types.ObjectId;
  name: string;
  department?: string;
  profilePicture?: string;
};

function upsertContact(map: Map<string, ChatContact>, contact: ChatContact) {
  const existing = map.get(contact._id);

  if (!existing) {
    map.set(contact._id, contact);
    return;
  }

  map.set(contact._id, {
    ...existing,
    ...contact,
    source: existing.source === 'friend' || contact.source === 'friend' ? 'friend' : 'message',
    lastMessageAt: existing.lastMessageAt && contact.lastMessageAt
        ? new Date(existing.lastMessageAt) > new Date(contact.lastMessageAt)
        ? existing.lastMessageAt
        : contact.lastMessageAt
      : existing.lastMessageAt || contact.lastMessageAt,
    lastMessagePreview: contact.lastMessagePreview || existing.lastMessagePreview,
    unreadCount: Math.max(existing.unreadCount || 0, contact.unreadCount || 0),
    name: contact.name || existing.name,
    department: contact.department || existing.department,
    profilePicture: contact.profilePicture || existing.profilePicture,
  });
}

export async function GET(req: Request) {
  try {
    const userId = await getSessionUserId(req);
    if (!userId) {
      return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: 'Your session is invalid. Please sign in again.' }, { status: 401 });
    }

    await connectDB();

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [friendships, messagePeers] = await Promise.all([
      Friendship.find({
        $or: [{ requester: userId }, { recipient: userId }],
        status: 'accepted',
      })
        .populate('requester', 'name department profilePicture')
        .populate('recipient', 'name department profilePicture')
        .lean(),
      Message.aggregate<{
        _id: mongoose.Types.ObjectId;
        lastMessageAt: Date;
        lastMessagePreview: string;
        unreadCount: number;
      }>([
        {
          $match: {
            $or: [{ sender: userObjectId }, { receiver: userObjectId }],
          },
        },
        {
          $project: {
            peerId: {
              $cond: [{ $eq: ['$sender', userObjectId] }, '$receiver', '$sender'],
            },
            createdAt: 1,
            content: 1,
            receiver: 1,
            read: 1,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $group: {
            _id: '$peerId',
            lastMessageAt: { $max: '$createdAt' },
            lastMessagePreview: { $first: '$content' },
            unreadCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$receiver', userObjectId] },
                      { $eq: ['$read', false] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
    ]);

    const contacts = new Map<string, ChatContact>();

    for (const friendship of friendships) {
      const requester = friendship.requester as unknown as PopulatedPeer | null | undefined;
      const recipient = friendship.recipient as unknown as PopulatedPeer | null | undefined;
      const peer = String(requester?._id || '') === userId ? recipient : requester;

      if (!peer?._id) continue;

      upsertContact(contacts, {
        _id: String(peer._id),
        name: peer.name || 'Campus user',
        department: peer.department,
        profilePicture: peer.profilePicture,
        source: 'friend',
      });
    }

    const messagePeerIds = messagePeers
      .map((peer) => String(peer._id))
      .filter((peerId) => mongoose.Types.ObjectId.isValid(peerId));
    const usersById = new Map<string, { _id: mongoose.Types.ObjectId; name: string; department?: string; profilePicture?: string }>();

    if (messagePeerIds.length > 0) {
      const users = await User.find({ _id: { $in: messagePeerIds } }, 'name department profilePicture').lean();
      for (const user of users) {
        usersById.set(String(user._id), user);
      }
    }

    for (const peer of messagePeers) {
      const user = usersById.get(String(peer._id));
      if (!user) continue;

      upsertContact(contacts, {
        _id: String(user._id),
        name: user.name || 'Campus user',
        department: user.department,
        profilePicture: user.profilePicture,
        source: 'message',
        lastMessageAt: peer.lastMessageAt?.toISOString(),
        lastMessagePreview: peer.lastMessagePreview,
        unreadCount: peer.unreadCount,
      });
    }

    const sortedContacts = Array.from(contacts.values()).sort((a, b) => {
      if (a.lastMessageAt && b.lastMessageAt) {
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
      }
      if (a.lastMessageAt) return -1;
      if (b.lastMessageAt) return 1;
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ contacts: sortedContacts });
  } catch (error) {
    console.error('Chat contacts GET failed:', error);
    return NextResponse.json({ error: 'Could not load chat contacts.' }, { status: 500 });
  }
}
