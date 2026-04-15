import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

export async function proxy(request: NextRequest) {
  const protectedRoutes = ['/dashboard', '/api/notes', '/api/ai', '/api/timetable', '/api/market', '/api/lost-found', '/api/friends', '/api/chat'];
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
      const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET || 'fallback_access_secret');
      await jose.jwtVerify(accessToken, secret);
      return NextResponse.next();
    }

    if (refreshCookie) {
      const secret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret');
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
  matcher: ['/dashboard/:path*', '/api/notes/:path*', '/api/ai/:path*', '/api/timetable/:path*', '/api/market/:path*', '/api/lost-found/:path*', '/api/friends/:path*', '/api/chat/:path*'],
};
