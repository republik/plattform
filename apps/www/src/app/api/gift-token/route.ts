import { NextRequest, NextResponse } from 'next/server'
import type { VerifiedGiftToken } from './types'
import { verifyGiftToken } from './verify'

/**
 * Checks a `?gift=` token, see `verify.ts`. A route rather than a server
 * action because the paynotes also run under the Pages Router (`_app.tsx`),
 * which has no server actions.
 *
 * 200 with the article and expiry for a token we signed (run out or not),
 * 404 for anything else.
 */
export async function GET(
  req: NextRequest,
): Promise<NextResponse<VerifiedGiftToken | null>> {
  const token = req.nextUrl.searchParams.get('token')
  const result = token ? verifyGiftToken(token) : null
  if (!result) {
    return NextResponse.json(null, { status: 404 })
  }
  return NextResponse.json(result)
}
