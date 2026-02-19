import { NextRequest, NextResponse } from 'next/server'

/**
 * In case the request is not on https, redirect to https if PUBLIC_BASE_URL is set to https
 * @param req to check if the request is not already on https
 * @returns possible NextResponse to redirect to https or null
 */
function redirectToHTTPS(req: NextRequest): NextResponse | null {
  const reqURL = new URL(req.nextUrl.clone())
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL
  if (
    !reqURL ||
    reqURL.protocol == 'https:' ||
    !baseURL ||
    !baseURL.startsWith('https://')
  ) {
    return null
  }

  reqURL.host = new URL(baseURL).host
  reqURL.protocol = 'https:'
  reqURL.port = ''

  return NextResponse.redirect(reqURL, {
    status: 308,
  })
}

function graphqlRewrite(req: NextRequest): NextResponse | null {
  if (req.nextUrl.pathname === '/graphql') {
    const headers = new Headers(req.headers)
    headers.set('x-api-gateway-client', process.env.API_GATEWAY_CLIENT ?? 'www')
    headers.set('x-api-gateway-token', process.env.API_GATEWAY_TOKEN ?? '')

    const res = NextResponse.rewrite(new URL(process.env.API_URL), {
      request: {
        headers,
      },
    })

    return res
  }
  return null
}

/**
 * Middleware used to redirect to HTTPS if not already on HTTPS and block IP addresses in the IP_BLOCKLIST.
 * @param req
 */
async function middlewareFunc(req: NextRequest): Promise<NextResponse> {
  const httpsRedirect = redirectToHTTPS(req)
  if (httpsRedirect) {
    return httpsRedirect
  }

  const gqlRewrite = graphqlRewrite(req)
  if (gqlRewrite) {
    return gqlRewrite
  }

  // Block if request is coming from IP_BLOCKLIST
  const fwdIp = req.headers.get('X-Forwarded-For')
  const clientIp = fwdIp ? fwdIp.split(',')[0] : ''

  const isBlocklistedIP =
    clientIp &&
    process.env.IP_BLOCKLIST &&
    process.env.IP_BLOCKLIST.includes(clientIp)

  if (isBlocklistedIP) {
    console.warn(`request with blocklisted IP denied. IP: ${clientIp}.`)
    return NextResponse.json({ message: 'Nope' }, { status: 401 })
  }

  return NextResponse.next()
}

export const middleware = middlewareFunc

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - monitoring (Sentry tunnel route)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|monitoring).*)',
  ],
}
