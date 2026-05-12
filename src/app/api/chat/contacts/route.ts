import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongoose';
import Friendship from '@/models/Friendship';
import Message from '@/models/Message';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { getJwtAccessSecret } from '@/lib/env';

type ContactSource = 'friend' | 'message';

type ChatContact = {
  _id: string;
  name: string;
  department?: string;
  profilePicture?: string;
  source: ContactSource;
  lastMessageAt?: string;
};

type PopulatedPeer = {
  _id: mongoose.Types.ObjectId;
  name: string;
  department?: string;
  profilePicture?: string;
};

function getUserId(req: Request) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;
  try {
    return (jwt.verify(token, getJwtAccessSecret()) as { userId?: string }).userId || null;
  } catch {
    return null;
  }
}

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
    name: contact.name || existing.name,
    department: contact.department || existing.department,
    profilePicture: contact.profilePicture || existing.profilePicture,
  });
}

export async function GET(req: Request) {
  const userId = getUserId(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        },
      },
      {
        $group: {
          _id: '$peerId',
          lastMessageAt: { $max: '$createdAt' },
        },
      },
    ]),
  ]);

  const contacts = new Map<string, ChatContact>();

  for (const friendship of friendships) {
    const requester = friendship.requester as unknown as PopulatedPeer;
    const recipient = friendship.recipient as unknown as PopulatedPeer;
    const peer = String(requester._id) === userId ? recipient : requester;

    upsertContact(contacts, {
      _id: String(peer._id),
      name: peer.name,
      department: peer.department,
      profilePicture: peer.profilePicture,
      source: 'friend',
    });
  }

  const messagePeerIds = messagePeers.map((peer) => String(peer._id));
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
      name: user.name,
      department: user.department,
      profilePicture: user.profilePicture,
      source: 'message',
      lastMessageAt: peer.lastMessageAt.toISOString(),
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
}
