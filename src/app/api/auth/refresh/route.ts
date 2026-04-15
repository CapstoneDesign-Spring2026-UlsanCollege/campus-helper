import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import { generateTokens } from '@/lib/auth';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
    }

    try {
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    const decoded = jwt.decode(refreshToken) as { userId: string, role: string } | null;
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    await connectDB();
    const user = await User.findById(decoded.userId);

    // Ensure session hasn't been revoked
    if (!user || user.refreshToken !== refreshToken) {
      return NextResponse.json({ error: 'Session invalidated' }, { status: 401 });
    }

    // Token Rotation Mechanics
    const tokens = generateTokens(user._id.toString(), user.role);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    cookieStore.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/api/auth/refresh',
    });

    return NextResponse.json({ accessToken: tokens.accessToken });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
