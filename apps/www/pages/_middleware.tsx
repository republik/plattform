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
  const userAgent = req.headers.get('user-agent')

  try {
    // Don't run the middleware unless on home-page
    if (req.nextUrl.pathname !== '/') {
      return NextResponse.next()
    }

    // Parse and verify JWT to decide about redirection
    const jwtBody = await parseAndVerifyJWT(req)
    const isMember = jwtBody?.roles.includes('member')

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

    if (isMember) {
      resUrl.pathname = '/front'
      return NextResponse.rewrite(resUrl)
    }

    resUrl.pathname = '/'
    return NextResponse.rewrite(resUrl)
  } catch (err) {
    ev.waitUntil(
      new Promise((resolve) => {
        // Sending the error to the api-route since the user-agent can not be
        // parsed in the middleware. However, we want the user-agent to be parsed
        // in order to have consistent logs.
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
