import { NextRequest, NextResponse } from 'next/server'

const SESSION_COOKIE = 'gym_session'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/treino')) {
    const session = request.cookies.get(SESSION_COOKIE)?.value

    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const parsed = JSON.parse(session)
      if (Date.now() > parsed.expiresAt) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/treino/:path*'],
}
