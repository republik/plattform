import { NextRequest, NextResponse } from 'next/server'
import {
  getJWTCookieValue,
  getSessionCookieValue,
  verifyJWT,
} from './lib/auth/JWTHelper'
import fetchMyRoles from './lib/helpers/middleware/FetchMeObject'

/**
 * Middleware used to conditionally redirect between the marketing and front page
 * depending on the user authentication status and roles.
 * @param req
 */
export async function middleware(req: NextRequest) {
  const resUrl = req.nextUrl.clone()
  // Rewrite if someone tries to directly access the front or the front-preview url
  if (
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

  /* ------------ Logic to handle SSG front- & marketing-page ------------ */

  /**
   * Rewrite to the front if the user is a member
   * @param roles Roles of the user
   * @returns NextResponse
   */
  function rewriteBasedOnRoles(roles: string[] = []): NextResponse {
    if (roles?.includes('member')) {
      resUrl.pathname = '/front'
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
    const { me, cookie } = await fetchMyRoles(req)

    const response = rewriteBasedOnRoles(me?.roles)

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
      return rewriteBasedOnRoles(jwtBody?.roles)
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
    return rewriteBasedOnToken(tokenCookie)
  } else if (sessionCookie) {
    // Rewrite if no JWT is present
    return rewriteBasedOnMe(req)
  }

  return NextResponse.next()
}
