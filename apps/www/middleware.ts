import { NextRequest, NextResponse } from 'next/server'

const CURTAIN_COOKIE_NAME = 'OpenSesame'
const CURTAIN_PASSTHROUGH_PATHS = [
  '/api/',
  '/_next/',
  '/static/',
  '/favicon.ico',
  '/mitteilung',
]

type Middleware = (req: NextRequest) => Promise<NextResponse>

/**
 * A HoC that returns a wrapped middleware hidden behind a curtain.
 * The curtain prevents the user from accessing the website unless the correct path is entered
 * or the correct cookie is set.
 * Once the curtain is lifted, the cookie renews itself and the user can access the website.
 * @param middleware The middleware to wrap
 * @returns The wrapped middleware
 */
function curtainHOC(middleware: Middleware): Middleware {
  const BACKDOOR_URL = process.env.CURTAIN_BACKDOOR_URL
  if (!BACKDOOR_URL) {
    return middleware
  }

  return async (req: NextRequest) => {
    const cookieValue = req.cookies.get(CURTAIN_COOKIE_NAME)?.value || ''
    const cookieValueDecoded = Buffer.from(cookieValue, 'base64').toString()
    const userAgent = req.headers.get('user-agent')

    if (
      CURTAIN_PASSTHROUGH_PATHS.some((path) =>
        req.nextUrl.pathname.startsWith(path),
      )
    ) {
      return middleware(req)
    }

    const hasBackdoorCookie = cookieValueDecoded === BACKDOOR_URL
    const hasBypassQueryparam =
      req.nextUrl.searchParams.get('open_sesame') ===
      BACKDOOR_URL.replace(/^\//, '')

    const isBackdoorPath = req.nextUrl.pathname === BACKDOOR_URL
    const isAllowedUserAgent =
      userAgent &&
      process.env.CURTAIN_UA_ALLOW_LIST &&
      (process.env.CURTAIN_UA_ALLOW_LIST || '')
        .split(',')
        .some((ua) => userAgent.includes(ua))

    if (
      !isBackdoorPath &&
      !hasBackdoorCookie &&
      !hasBypassQueryparam &&
      !isAllowedUserAgent
    ) {
      return new NextResponse(process.env.CURTAIN_MESSAGE || null, {
        status: 401,
      })
    }

    // helper to attach the curtain cookie to the response
    const applyCurtainCookie = (res: NextResponse): NextResponse => {
      if (res) {
        const b64backdoorURL = Buffer.from(BACKDOOR_URL).toString('base64')
        res.cookies.set(CURTAIN_COOKIE_NAME, b64backdoorURL, {
          maxAge: 60 * 60 * 24 * 30, // 30 days
        })
      }
      return res
    }

    if (isBackdoorPath) {
      const url = req.nextUrl.clone()
      url.pathname = '/'
      return applyCurtainCookie(NextResponse.redirect(url.toString()))
    }

    if (hasBypassQueryparam) {
      const url = req.nextUrl.clone()
      url.searchParams.delete('open_sesame')
      return applyCurtainCookie(NextResponse.redirect(url.toString()))
    }

    const res = await middleware(req)

    return applyCurtainCookie(res)
  }
}

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

/**
 * Middleware used to conditionally redirect between the marketing and front page
 * depending on the user authentication status and roles.
 * @param req
 */
async function middlewareFunc(req: NextRequest): Promise<NextResponse> {
  const httpsRedirect = redirectToHTTPS(req)
  if (httpsRedirect) {
    return httpsRedirect
  }

  const resUrl = req.nextUrl.clone()

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

  // Rewrite if someone tries to directly access the front or the front-preview url
  if (
    req.nextUrl.pathname === '/marketing' ||
    req.nextUrl.pathname === '/front' ||
    req.nextUrl.pathname.startsWith('/_front/')
  ) {
    resUrl.pathname = '/404'
    return NextResponse.rewrite(resUrl)
  }

  // Don't run the middleware unless on home-page
  if (req.nextUrl.pathname !== '/') {
    return NextResponse.next()
  }
  // Redirect to front-preview ssr to generate article front-preview
  // used in the yearly overview
  if (resUrl.searchParams.has('extractId')) {
    // Remap extractId query param to id-slug
    const extractId = resUrl.searchParams.get('extractId')
    resUrl.searchParams.delete('extractId')
    resUrl.pathname = `/_front/${extractId}`
    return NextResponse.rewrite(resUrl)
  }

  return NextResponse.next()
}

export const middleware = curtainHOC(middlewareFunc)

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
