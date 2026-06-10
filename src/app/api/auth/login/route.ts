import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import { comparePassword, generateTokens } from '@/lib/auth';
import { isRedisClientConfigured, redis } from '@/lib/redis';
import { cookies } from 'next/headers';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `rate-limit:login:${ip}`;
    
    if (isRedisClientConfigured()) {
      const requests = await redis.incr(rateLimitKey);
      if (requests === 1) await redis.expire(rateLimitKey, 60);
      if (requests > 10) {
        return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 });
      }
    } else if (process.env.NODE_ENV !== 'production') {
      console.warn('[login] REDIS_URL not set; skipping Redis rate limiting (development mode).');
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' }, { status: 400 });
    }
    const data = parsed.data;

    await connectDB();

    const user = await User.findOne({ email: data.email });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Temporary account lock after repeated failed sign-in attempts.
    if (user.lockUntil && user.lockUntil > new Date()) {
      return NextResponse.json({ error: 'Account is locked due to multiple failed attempts. Try again later.' }, { status: 403 });
    }

    const isMatch = await comparePassword(data.password, user.password);

    if (!isMatch) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
      }
      await user.save();
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Reset failed-attempt tracking after a successful login.
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);

    user.refreshToken = refreshToken;
    await user.save();

    const cookieStore = await cookies();
    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 Days
      path: '/',
    });

    return NextResponse.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        gender: user.gender,
        profilePicture: user.profilePicture,
        department: user.department,
        currentSemesterId: user.currentSemesterId,
        admissionYear: user.admissionYear,
      }
    });
  } catch (error: unknown) {
    console.error('Login route error:', error);
    return NextResponse.json({ error: 'Could not sign in right now. Please try again.' }, { status: 500 });
  }
}
