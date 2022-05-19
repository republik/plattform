import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'
import { parseAndVerifyJWT } from '../lib/auth/JWT/JWTHelper'

/**
 * Middleware used to conditionally redirect between the marketing- and front-page
 * depending on the user authentication status and roles.
 * @param req
 * @param ev
 */
export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  const resUrl = req.nextUrl.clone()

  // Don't run the middleware unless on home-page
  if (req.nextUrl.pathname !== '/') {
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

    resUrl.pathname = `/_ssr/front-preview/${extractId}`

    return NextResponse.rewrite(resUrl)
  }

  try {
    // Parse and verify JWT to decide about redirection
    const jwtBody = await parseAndVerifyJWT(req)
    const isMember = jwtBody?.roles?.includes('member')

    if (isMember) {
      resUrl.pathname = '/front'
      return NextResponse.rewrite(resUrl)
    } else {
      const sessionCookieString = req.cookies?.[process.env.COOKIE_NAME]
      if (sessionCookieString) {
        resUrl.searchParams.append('syncUser', '1')
      }
    }
  } catch (err) {
    console.error('JWT Verification Error', err)
    // Render marketing-page. Once me is fetched the new JWT will be available
    // And if the user has access he will be rewritten to /front
  }

  resUrl.pathname = '/'
  return NextResponse.rewrite(resUrl)
}
