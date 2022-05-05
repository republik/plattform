import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'
import { parseAndVerifyJWT } from '../lib/middlewares/JWT/JWTHelper'

/**
 * Middleware used to conditionally redirect between the marketing- and front-page
 * depending on the user authentication status and roles.
 * @param req
 * @param ev
 */
export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  const url = req.nextUrl.clone()
  try {
    // Don't run the middleware unless on home-page
    if (url.pathname !== '/') {
      return NextResponse.next()
    }
    // Parse and verify JWT to decide about redirection
    const jwtBody = await parseAndVerifyJWT(req)
    console.log('Validated payload', jwtBody)
    if (jwtBody) {
      url.pathname = jwtBody.roles.includes('member') ? '/front' : '/'
      return NextResponse.rewrite(url)
    } else {
      url.pathname = '/'
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  } catch (err) {
    url.pathname = '/500'
    // TODO: log middleware errors
    return NextResponse.rewrite(url)
  }
}
