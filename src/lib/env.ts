function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getJwtAccessSecret() {
  return requiredEnv('JWT_ACCESS_SECRET');
}

export function getJwtRefreshSecret() {
  return requiredEnv('JWT_REFRESH_SECRET');
}

export function getAppBaseUrl() {
  const explicit =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (explicit) {
    return explicit.startsWith('http') ? explicit : `https://${explicit}`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}

export function getMongoUri() {
  return requiredEnv('MONGODB_URI');
}
