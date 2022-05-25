import { NextRequest, NextResponse } from 'next/server'
import {
  getSessionCookieValue,
  parseAndVerifyJWT,
} from '../lib/auth/JWT/JWTHelper'
import updateUserCookies from '../lib/helpers/middleware/UpdateUserCookies'

/**
 * Middleware used to conditionally redirect between the marketing and front page
 * depending on the user authentication status and roles.
 * @param req
 */
export async function middleware(req: NextRequest) {
  const resUrl = req.nextUrl.clone()

  // Don't run the middleware unless on home-page
  if (resUrl.pathname !== '/') {
    return NextResponse.next()
  }

  // Redirect to front-preview ssr to generate article front-preview
  // used in the yearly overview
  if (resUrl.searchParams.has('extractId')) {
    // Remap extractId query param to id-slug
    const extractId = resUrl.searchParams.get('extractId')
    resUrl.searchParams.delete('extractId')
    resUrl.pathname = `/_ssr/front/${extractId}`
    return NextResponse.rewrite(resUrl)
  }

  async function updateUserCookiesAndReRun(): Promise<NextResponse> {
    // Rewrite to gateway in order to fetch a JWT
    const cookies = await updateUserCookies(req)
    resUrl.pathname = '/'
    const response = NextResponse.redirect(resUrl)
    response.headers.set('Set-Cookie', cookies)
    return response
  }

  try {
    // Parse and verify JWT to decide about redirection
    const jwtBody = await parseAndVerifyJWT(req)

    if (jwtBody) {
      if (jwtBody.roles?.includes('member')) {
        resUrl.pathname = '/front'
        return NextResponse.rewrite(resUrl)
      }
    } else if (getSessionCookieValue(req)) {
      return updateUserCookiesAndReRun()
    }
  } catch (err) {
    // Rewrite to gateway to fetch a new valid JWT
    console.error('JWT Verification Error', err)
    return updateUserCookiesAndReRun()
  }

  return NextResponse.next()
}
