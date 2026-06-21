import { NextRequest, NextResponse } from 'next/server';

const SUBDOMAIN_ROUTES: Record<string, string> = {
  pos: '/pos',
  kds: '/kds',
  app: '/dashboard',
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Extract subdomain (e.g., pos.restaurantos.com -> pos)
  const parts = hostname.split('.');
  const subdomain = parts.length >= 3 ? parts[0] : null;

  // If we're on a known subdomain and at root, rewrite to the appropriate page
  if (subdomain && SUBDOMAIN_ROUTES[subdomain] && url.pathname === '/') {
    url.pathname = SUBDOMAIN_ROUTES[subdomain];
    return NextResponse.rewrite(url);
  }

  // Add subdomain info to headers for client-side use
  const response = NextResponse.next();
  response.headers.set('x-subdomain', subdomain || 'app');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
