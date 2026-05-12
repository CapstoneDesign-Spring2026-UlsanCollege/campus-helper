import jwt from 'jsonwebtoken';
import { getJwtAccessSecret } from '@/lib/env';

export function getAdminUserId(req: Request) {
  const token = req.headers.get('authorization')?.split(' ')[1];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, getJwtAccessSecret()) as { userId?: string; role?: string };
    if (decoded.role !== 'admin' || !decoded.userId) return null;
    return decoded.userId;
  } catch {
    return null;
  }
}
