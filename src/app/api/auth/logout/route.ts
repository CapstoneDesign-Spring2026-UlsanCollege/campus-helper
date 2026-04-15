import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongoose';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;

    if (refreshToken) {
      const decoded = jwt.decode(refreshToken) as { userId: string } | null;
      if (decoded) {
        await connectDB();
        await User.findByIdAndUpdate(decoded.userId, { refreshToken: null });
      }
      cookieStore.delete('refreshToken');
    }

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
