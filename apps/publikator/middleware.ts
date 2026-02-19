import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  /**
   * Proxy requests to /graphql to the API with authentication headers
   */
  if (req.nextUrl.pathname === '/graphql') {
    const headers = new Headers(req.headers)
    headers.set('x-api-gateway-client', 'publikator')
    headers.set('x-api-gateway-token', process.env.API_GATEWAY_TOKEN ?? '')

    const res = NextResponse.rewrite(new URL(process.env.NEXT_PUBLIC_API_URL), {
      request: {
        headers,
      },
    })

    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - monitoring (Sentry tunnel route)
     * - __plsb (Plausible proxy)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|monitoring|__plsb).*)',
  ],
}
