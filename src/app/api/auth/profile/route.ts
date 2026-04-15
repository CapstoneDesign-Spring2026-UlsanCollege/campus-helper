import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import * as jose from 'jose';

export async function PUT(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET || 'fallback_access_secret');
    const { payload } = await jose.jwtVerify(token, secret);
    
    if (!payload || !payload.id) {
       return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
    }

    const { profilePicture } = await req.json();

    await connectDB();
    const updatedUser = await User.findByIdAndUpdate(
       payload.id,
       { $set: { profilePicture } },
       { new: true }
    ).select('-password');

    if (!updatedUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ message: 'Profile updated', user: { id: updatedUser._id, name: updatedUser.name, role: updatedUser.role, gender: updatedUser.gender, profilePicture: updatedUser.profilePicture, department: updatedUser.department } });
  } catch (error) {
    return NextResponse.json({ error: 'Server disruption' }, { status: 500 });
  }
}
