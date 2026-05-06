import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getJwtAccessSecret, getJwtRefreshSecret } from '@/lib/env';

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generateTokens(userId: string, role: string) {
  const accessToken = jwt.sign(
    { userId, role },
    getJwtAccessSecret(),
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    getJwtRefreshSecret(),
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}
