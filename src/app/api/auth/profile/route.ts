import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

function getUserId(req: Request) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'fallback_access_secret'
    ) as jwt.JwtPayload & { userId?: string; id?: string };

    return payload.userId || payload.id || null;
  } catch {
    return null;
  }
}

export async function PUT(req: Request) {
  try {
    const userId = getUserId(req);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { profilePicture } = await req.json();
    if (typeof profilePicture !== 'string') {
      return NextResponse.json({ error: 'Profile picture URL is required' }, { status: 400 });
    }

    await connectDB();
    const updatedUser = await User.findByIdAndUpdate(
       userId,
       { $set: { profilePicture: profilePicture.trim() } },
       { new: true }
    ).select('-password');

    if (!updatedUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ message: 'Profile updated', user: { id: updatedUser._id, name: updatedUser.name, role: updatedUser.role, gender: updatedUser.gender, profilePicture: updatedUser.profilePicture, department: updatedUser.department } });
  } catch (error) {
    return NextResponse.json({ error: 'Server disruption' }, { status: 500 });
  }
}
