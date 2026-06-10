import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import { generateTokens } from '@/lib/auth';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getJwtRefreshSecret } from '@/lib/env';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: 'No refresh token provided' }, { status: 401 });
    }

    try {
      jwt.verify(refreshToken, getJwtRefreshSecret());
    } catch {
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    const decoded = jwt.decode(refreshToken) as { userId: string, role: string } | null;
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    await connectDB();
    const user = await User.findById(decoded.userId);

    // Ensure the saved session still matches the refresh token cookie.
    if (!user || user.refreshToken !== refreshToken) {
      return NextResponse.json({ error: 'Session invalidated' }, { status: 401 });
    }

    // Rotate tokens on refresh.
    const tokens = generateTokens(user._id.toString(), user.role);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    cookieStore.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return NextResponse.json({ accessToken: tokens.accessToken });
  } catch {
    return NextResponse.json({ error: 'Could not refresh your session. Please sign in again.' }, { status: 500 });
  }
}
