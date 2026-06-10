import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import User from '@/models/User';
import connectDB from '@/lib/mongoose';
import { getJwtAccessSecret, getJwtRefreshSecret } from '@/lib/env';

export async function getSessionUserId(req: Request) {
  const authToken = req.headers.get('authorization')?.split(' ')[1];

  if (authToken) {
    try {
      const payload = jwt.verify(authToken, getJwtAccessSecret()) as { userId?: string; id?: string };
      return payload.userId || payload.id || null;
    } catch {
      // fall through to refresh cookie
    }
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;
  if (!refreshToken) return null;

  try {
    jwt.verify(refreshToken, getJwtRefreshSecret());
    const decoded = jwt.decode(refreshToken) as { userId?: string } | null;
    if (!decoded?.userId) return null;

    await connectDB();
    const user = await User.findById(decoded.userId).select('refreshToken').lean();
    if (!user || user.refreshToken !== refreshToken) return null;

    return decoded.userId;
  } catch {
    return null;
  }
}

export async function getOptionalSessionUserId(req: Request) {
  try {
    return await getSessionUserId(req);
  } catch {
    return null;
  }
}
