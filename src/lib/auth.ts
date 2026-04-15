import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

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
    process.env.JWT_ACCESS_SECRET || 'fallback_access_secret',
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, role },
    process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}
