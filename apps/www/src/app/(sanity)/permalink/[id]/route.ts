import { DOCUMENT_SLUG_BY_ID } from '@/app/(sanity)/groq/document-slug-by-id'
import { sanityClientFetch } from '@/app/(sanity)/lib/fetch'
import { notFound } from 'next/navigation'
import { NextResponse, type NextRequest } from 'next/server'

export const revalidate = 60

export async function GET(
  req: NextRequest,
  { params }: RouteContext<'/permalink/[id]'>,
) {
  const { id } = await params
  const search = req.nextUrl.search

  const slug = await sanityClientFetch(
    DOCUMENT_SLUG_BY_ID,
    { id },
    { tag: 'permalink' },
  )

  if (!slug) {
    notFound()
  }

  const url = new URL(slug, process.env.NEXT_PUBLIC_BASE_URL)
  url.search = search

  return NextResponse.redirect(url)
}
