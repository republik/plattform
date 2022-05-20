import { NextRequest, NextResponse } from 'next/server'
import {
  getSessionCookieValue,
  parseAndVerifyJWT,
} from '../lib/auth/JWT/JWTHelper'

/**
 * Middleware used to conditionally redirect between the marketing- and front-page
 * depending on the user authentication status and roles.
 * @param req
 */
export async function middleware(req: NextRequest) {
  const resUrl = req.nextUrl

  // Don't run the middleware unless on home-page
  if (
    req.nextUrl.pathname !== '/' ||
    req.nextUrl.searchParams.has('syncUser')
  ) {
    return NextResponse.next()
  }

  // Redirect to front-preview ssr to generate article front-preview
  // used in the yearly overview
  if (
    !req.nextUrl.searchParams.has('marketing') &&
    req.nextUrl.searchParams.has('extractId')
  ) {
    // Remap extractId query param to id-slug
    const extractId = req.nextUrl.searchParams.get('extractId')
    resUrl.searchParams.delete('extractId')

    resUrl.pathname = `/_ssr/front/${extractId}`

    return NextResponse.rewrite(resUrl)
  }

  try {
    // Parse and verify JWT to decide about redirection
    const jwtBody = await parseAndVerifyJWT(req)

    if (jwtBody) {
      if (jwtBody?.roles?.includes('member')) {
        resUrl.pathname = '/front'
        return NextResponse.rewrite(resUrl)
      }
    } else if (getSessionCookieValue(req)) {
      console.log('No JWT found, but session cookie found - must sync')
      resUrl.searchParams.append('syncUser', '1')
    }
  } catch (err) {
    console.error('JWT Verification Error', err)
    resUrl.searchParams.append('syncUser', '1')
    // JWT is faulty and must be synced
  }

  resUrl.pathname = '/'
  console.log('Marketing page', resUrl.toString())

  if (req.nextUrl.searchParams.has('syncUser')) {
    return NextResponse.redirect(resUrl)
  }

  return NextResponse.rewrite(resUrl)
}
