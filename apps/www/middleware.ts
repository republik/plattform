import { NextRequest, NextResponse } from 'next/server'
import { getJWTCookieValue, getSessionCookieValue, verifyJWT } from './lib/auth/JWTHelper'
import fetchMeObject from './lib/helpers/middleware/FetchMeObject'

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
 * Middleware used for various redirect purposes
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

  // Redirect to front-preview ssr to generate article front-preview
  // used in the yearly overview
  if (req.nextUrl.pathname === '/' && resUrl.searchParams.has('extractId')) {
    // Remap extractId query param to id-slug
    const extractId = resUrl.searchParams.get('extractId')
    resUrl.searchParams.delete('extractId')
    resUrl.pathname = `/_front/${extractId}`
    return NextResponse.rewrite(resUrl)
  }

  if (req.nextUrl.pathname.startsWith('/einrichten')) {
    // Let onboarding pages pass through the middleware
    return NextResponse.next()
  }

  /**
   * Rewrite to the onboarding if the user has not completed onboarding yet.
   * @param notOnboarded The date when the user completed onboarding
   * @returns NextResponse
   */
  function rewriteBasedOnOnboardingStatus(
    notOnboarded?: boolean,
  ): NextResponse {
    if (notOnboarded) {
      resUrl.pathname = '/einrichten/willkommen'
      return NextResponse.rewrite(resUrl)
    }

    return NextResponse.next()
  }

  /**
   * Load me from the API and rewrite according to the loaded me object.
   * Also add the set-cookie header to the response.
   * @param req
   * @returns
   */
  async function rewriteBasedOnMe(req: NextRequest): Promise<NextResponse> {
    const { me, cookie } = await fetchMeObject(req)

    const response = rewriteBasedOnOnboardingStatus(!!me && !me?.onboarded)

    if (cookie) {
      // Forward cookies to the client
      response.headers.set('Set-Cookie', cookie)
    }

    return response
  }

  /**
   * Redirect based on the jwt-token after it was successfully validated
   * @param token JWT found in the cookie header
   * @returns NextResponse
   */
  async function rewriteBasedOnToken(token: string): Promise<NextResponse> {
    try {
      // Parse and verify JWT to decide about redirection
      const jwtBody = await verifyJWT(token)

      // empty jwt-payload -> expired session-cookie
      return rewriteBasedOnOnboardingStatus(!jwtBody?.onboarded)
    } catch (err) {
      // Rewrite to gateway to fetch a new valid JWT
      console.error('JWT Verification Error', err)
      // Rewrite based on fetched me object
      return rewriteBasedOnMe(req)
    }
  }

  const sessionCookie = getSessionCookieValue(req)
  const tokenCookie = getJWTCookieValue(req)

  if (sessionCookie && tokenCookie) {
    // Rewrite based on token
    return await rewriteBasedOnToken(tokenCookie)
  } else {
    // Rewrite if no JWT is present
    return await rewriteBasedOnMe(req)
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
