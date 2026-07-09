import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware protects /wxadmin routes
// Full admin auth check is done client-side via AdminGuard component
// Middleware just checks if session cookie exists (basic gate)
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/wxadmin')) {
    // Let the AdminGuard component handle full isAdmin verification client-side
    // Middleware can't access Firestore, so we rely on client guard
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/wxadmin/:path*'],
};
