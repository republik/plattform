import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import fetchMyRoles from './lib/middleware/FetchMeObject'

/**
 * Load me from the API and rewrite according to the loaded me object.
 * Also add the set-cookie header to the response.
 * @param req
 * @returns
 */
async function onlyAllowEditorRole(req: NextRequest): Promise<NextResponse> {
  const { me, cookie } = await fetchMyRoles(req)

  let response: NextResponse

  if (me?.roles.includes('editor')) {
    response = NextResponse.next()
  } else {
    response = new NextResponse('Only editors can access this route', {
      status: 401,
    })
  }

  if (cookie) {
    // Forward cookies to the client
    response.headers.set('Set-Cookie', cookie)
  }

  return response
}

export async function middleware(req: NextRequest) {
  return onlyAllowEditorRole(req)
}

export const config = {
  matcher: '/datawrapper/:path*',
}
