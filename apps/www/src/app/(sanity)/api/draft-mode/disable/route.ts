import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'
// set redirect to your preferred location

export async function GET() {
  ;(await draftMode()).disable()
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_URL))
}
