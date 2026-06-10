import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Friendship from '@/models/Friendship';
import User from '@/models/User';
import { createNotification } from '@/lib/notifications';
import { getSessionUserId } from '@/lib/server-auth';

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
}

export async function GET(req: Request) {
  const userId = await getSessionUserId(req);
  if(!userId) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'search') {
      const query = normalizeText(searchParams.get('q')).slice(0, 60);
      if (!query) return NextResponse.json([]);

      const users = await User.find({
        _id: { $ne: userId },
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { department: { $regex: query, $options: 'i' } },
          { studentId: { $regex: query, $options: 'i' } },
        ],
      }, 'name department studentId profilePicture currentSemesterId admissionYear').limit(20);
      return NextResponse.json(users);
    }

    const [pending, outgoing, connections] = await Promise.all([
      Friendship.find({ recipient: userId, status: 'pending' })
        .populate('requester', 'name department studentId profilePicture currentSemesterId admissionYear'),
      Friendship.find({ requester: userId, status: 'pending' })
        .populate('recipient', 'name department studentId profilePicture currentSemesterId admissionYear'),
      Friendship.find({
        $or: [{ requester: userId }, { recipient: userId }],
        status: 'accepted'
      })
        .populate('requester', 'name department studentId profilePicture currentSemesterId admissionYear')
        .populate('recipient', 'name department studentId profilePicture currentSemesterId admissionYear'),
    ]);

    return NextResponse.json({ pending, outgoing, connections });
  } catch (error) {
    console.error('Friends GET failed:', error);
    return NextResponse.json({ error: 'We could not load your network right now.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getSessionUserId(req);
  if(!userId) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const targetId = normalizeText(body.targetId);
  if (!targetId) return NextResponse.json({ error: 'A target user is required.' }, { status: 400 });
  if (targetId === userId) return NextResponse.json({ error: 'You cannot send a request to yourself.' }, { status: 400 });

  try {
    await connectDB();
    
    const existing = await Friendship.findOne({
      $or: [
         { requester: userId, recipient: targetId },
         { requester: targetId, recipient: userId }
      ]
    });
    if(existing) return NextResponse.json({ error: 'A connection request already exists for this user.' }, { status: 400 });

    const doc = await Friendship.create({ requester: userId, recipient: targetId });
    const requester = await User.findById(userId, 'name').lean();
    if (requester?.name) {
      await createNotification({
        userId: targetId,
        type: 'friend_request',
        title: 'New friend request',
        body: `${requester.name} sent you a friend request.`,
        link: '/dashboard/network',
      });
    }
    return NextResponse.json(doc);
  } catch (error) {
    console.error('Friends POST failed:', error);
    return NextResponse.json({ error: 'We could not send that request right now.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const userId = await getSessionUserId(req);
  if(!userId) return NextResponse.json({ error: 'Your session expired. Please sign in again.' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const friendshipId = normalizeText(body.friendshipId);
  const action = body.action === 'accept' ? 'accept' : 'reject';
  if (!friendshipId) return NextResponse.json({ error: 'A friendship request is required.' }, { status: 400 });

  try {
    await connectDB();

    if (action === 'accept') {
      const doc = await Friendship.findOneAndUpdate({ _id: friendshipId, recipient: userId }, { status: 'accepted' }, { new: true });
      const accepter = await User.findById(userId, 'name').lean();
      if (doc && accepter?.name) {
        await createNotification({
          userId: String(doc.requester),
          type: 'friend_accept',
          title: 'Friend request accepted',
          body: `${accepter.name} accepted your connection request.`,
          link: '/dashboard/network',
        });
      }
      return NextResponse.json(doc);
    } else {
      await Friendship.findOneAndDelete({ _id: friendshipId, recipient: userId });
      return NextResponse.json({ message: 'Rejected connection' });
    }
  } catch (error) {
    console.error('Friends PUT failed:', error);
    return NextResponse.json({ error: 'We could not update that request right now.' }, { status: 500 });
  }
}
