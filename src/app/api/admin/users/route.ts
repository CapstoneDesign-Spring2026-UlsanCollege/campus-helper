import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import Note from '@/models/Note';
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

export async function GET(req: Request) {
  try {
    if (!getAdminUserId(req)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const adminId = getAdminUserId(req);
    if (!adminId) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    if (userId === adminId) return NextResponse.json({ error: 'You cannot delete your own admin account' }, { status: 400 });

    await connectDB();
    const target = await User.findById(userId);
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (target.role === 'admin') return NextResponse.json({ error: 'Admin accounts cannot be deleted here' }, { status: 400 });

    await User.findByIdAndDelete(userId);
    await Note.deleteMany({ uploadedBy: userId });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
