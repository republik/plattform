import { NextFetchEvent, NextRequest, NextResponse } from 'next/server'
import { getJWTPayload } from '../lib/middlewares/JWT/JWTHelper'

export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  const url = req.nextUrl.clone()
  try {
    const jwtBody = await getJWTPayload(req)
    if (req.nextUrl.pathname === '/' && jwtBody) {
      url.pathname = jwtBody?.roles.includes('member') ? '/front' : '/'
      console.log('rewritting to', url.pathname, jwtBody?.roles)
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  } catch (err) {
    url.pathname = '/500'
    return NextResponse.rewrite(url)
  }
}
