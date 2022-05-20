import { NextRequest, NextResponse } from 'next/server'
import {
  getSessionCookieValue,
  parseAndVerifyJWT,
} from '../lib/auth/JWT/JWTHelper'

/**
 * Middleware used to conditionally redirect between the marketing and front page
 * depending on the user authentication status and roles.
 * @param req
 */
export async function middleware(req: NextRequest) {
  const resUrl = req.nextUrl.clone()

  // Don't run the middleware unless on home-page
  if (resUrl.pathname !== '/' || resUrl.searchParams.has('syncUser')) {
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

  let syncUser
  try {
    // Parse and verify JWT to decide about redirection
    const jwtBody = await parseAndVerifyJWT(req)

    if (jwtBody) {
      if (jwtBody.roles?.includes('member')) {
        resUrl.pathname = '/front'
        return NextResponse.rewrite(resUrl)
      }
    } else if (getSessionCookieValue(req)) {
      syncUser = true
    }
  } catch (err) {
    console.error('JWT Verification Error', err)
    syncUser = true
  }

  if (syncUser) {
    resUrl.pathname = '/_ssr/gateway'
    return NextResponse.rewrite(resUrl)
  }

  return NextResponse.next()
}
