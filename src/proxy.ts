import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';
import { getJwtAccessSecret, getJwtRefreshSecret } from '@/lib/env';

export async function proxy(request: NextRequest) {
  const protectedRoutes = ['/dashboard', '/api/notes', '/api/upload', '/api/ai', '/api/timetable', '/api/market', '/api/lost-found', '/api/friends', '/api/chat', '/api/notifications'];
  const isProtected = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));

  if (!isProtected) {
    return NextResponse.next();
  }

  const authHeader = request.headers.get('authorization');
  const accessToken = authHeader?.split(' ')[1];
  const refreshCookie = request.cookies.get('refreshToken')?.value;

  if (!accessToken && !refreshCookie) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    if (accessToken) {
      const secret = new TextEncoder().encode(getJwtAccessSecret());
      await jose.jwtVerify(accessToken, secret);
      return NextResponse.next();
    }

    if (refreshCookie) {
      const secret = new TextEncoder().encode(getJwtRefreshSecret());
      await jose.jwtVerify(refreshCookie, secret);
      return NextResponse.next();
    }
  } catch {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Token expired or invalid' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/notes/:path*', '/api/upload/:path*', '/api/ai/:path*', '/api/timetable/:path*', '/api/market/:path*', '/api/lost-found/:path*', '/api/friends/:path*', '/api/chat/:path*', '/api/notifications/:path*'],
};
