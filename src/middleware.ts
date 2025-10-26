import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Skip middleware for test page
  if (req.nextUrl.pathname === '/test') {
    return NextResponse.next()
  }

  // Skip middleware for API routes, static files, etc.
  if (
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // For client-side authentication, we'll let the pages handle redirects
  // since we're using localStorage for session management
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
