import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'
import { parseAndVerifyJWT } from '../lib/auth/JWT/JWTHelper'
import { NativeAppHelpers } from '../lib/withInNativeApp'

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
    const isMember = jwtBody?.roles.includes('member')

    // Redirect to legacy-ssr page to generate page for tep
    if (
      !req.nextUrl.searchParams.has('marketing') &&
      req.nextUrl.searchParams.has('extractId')
    ) {
      console.log('Redirecting to legacy-ssr page')
      url.pathname = '/ssr/'
      const res = NextResponse.rewrite(url)
      console.log('Cache-control ssr', res.headers.get('cache-control'))
      return res
    }

    if (isMember) {
      url.pathname = '/front'
      const res = NextResponse.rewrite(url)
      console.log('Cache-control front', res.headers.get('cache-control'))
      return res
    }
    // Render marketing-page
    const userAgent = req.headers.get('user-agent')
    const isInNativeIOSApp =
      !!NativeAppHelpers.getIOSVersion(userAgent) &&
      !!NativeAppHelpers.getNativeAppVersion(userAgent)
    // Show login instead of marketing page in native app on IOS if version < 2.1.0
    if (
      isInNativeIOSApp &&
      !NativeAppHelpers.isNewerVersion(
        '2.1.0',
        NativeAppHelpers.getNativeAppVersion(userAgent),
      )
    ) {
      url.pathname = '/anmelden'
    } else {
      url.pathname = '/'
    }
    const res = NextResponse.rewrite(url)
    console.log('Cache control marketing', res.headers.get('cache-control'))
    return res
  } catch (err) {
    url.pathname = '/500'
    // TODO: log middleware errors
    return NextResponse.rewrite(url)
  }
}
