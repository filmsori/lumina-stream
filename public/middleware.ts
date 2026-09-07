import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  if (url.pathname.startsWith('/film/')) {
    url.pathname = url.pathname.replace('/film/', '/filmek/');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/film/:path*',
};