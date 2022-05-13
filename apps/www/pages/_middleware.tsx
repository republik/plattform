import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'
import { parseAndVerifyJWT } from '../lib/auth/JWT/JWTHelper'
import { NativeAppHelpers } from '../lib/withInNativeApp'
import reportError from '../lib/errors/reportError'

/**
 * Middleware used to conditionally redirect between the marketing- and front-page
 * depending on the user authentication status and roles.
 * @param req
 * @param ev
 */
export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  const resUrl = req.nextUrl.clone()
  const userAgent = req.headers.get('user-agent')

  try {
    // Don't run the middleware unless on home-page
    if (req.nextUrl.pathname !== '/') {
      return NextResponse.next()
    }

    // Parse and verify JWT to decide about redirection
    const jwtBody = await parseAndVerifyJWT(req)
    const isMember = jwtBody?.roles.includes('member')

    // Redirect to legacy-ssr page to generate page for yearly view
    if (
      !req.nextUrl.searchParams.has('marketing') &&
      req.nextUrl.searchParams.has('extractId')
    ) {
      resUrl.pathname = '/ssr/'
      return NextResponse.rewrite(resUrl)
    }

    if (isMember) {
      resUrl.pathname = '/front'
      return NextResponse.rewrite(resUrl)
    }
    // Render marketing-page
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
      resUrl.pathname = '/anmelden'
    } else {
      resUrl.pathname = '/'
    }
    return NextResponse.rewrite(resUrl)
  } catch (err) {
    ev.waitUntil(
      new Promise((resolve) => {
        fetch(`${req.nextUrl.protocol}//${req.nextUrl.host}/api/reportError`, {
          headers: {
            'user-agent': userAgent, // Forward the client user agent
          },
          method: 'POST',
          body: err.stack,
        })
          .catch((err) =>
            console.log('Failed to report error in middleware', err, resUrl),
          )
          .finally(() => resolve(null))
      }),
    )
  }
}
