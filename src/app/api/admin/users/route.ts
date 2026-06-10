import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import Note from '@/models/Note';
import { getAdminUserId } from '@/lib/admin-auth';

export async function GET(req: Request) {
  try {
    if (!getAdminUserId(req)) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    await connectDB();
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Admin users GET failed:', error);
    return NextResponse.json({ error: 'We could not load user records right now.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const adminId = getAdminUserId(req);
    if (!adminId) {
      return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
    if (userId === adminId) return NextResponse.json({ error: 'You cannot delete your own admin account here.' }, { status: 400 });

    await connectDB();
    const target = await User.findById(userId);
    if (!target) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    if (target.role === 'admin') return NextResponse.json({ error: 'Admin accounts cannot be deleted here.' }, { status: 400 });

    await User.findByIdAndDelete(userId);
    await Note.deleteMany({ uploadedBy: userId });

    return NextResponse.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Admin users DELETE failed:', error);
    return NextResponse.json({ error: 'We could not delete that user right now.' }, { status: 500 });
  }
}
