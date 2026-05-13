import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const dm = await draftMode()
  dm.disable()

  // set redirect to your preferred location
  return NextResponse.redirect(
    new URL('/articles', process.env.NEXT_PUBLIC_BASE_URL),
  )
}
