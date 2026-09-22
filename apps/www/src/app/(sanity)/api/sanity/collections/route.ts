import { COLLECTIONS_QUERY } from '@/app/(sanity)/groq/collections-query'
import { sanityClientFetch } from '@/app/(sanity)/lib/fetch'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response(undefined, {
      status: 400,
      statusText: 'invalid request body',
    })
  }

  const ids = (body as { ids?: unknown })?.ids
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) {
    return new Response(undefined, {
      status: 400,
      statusText: 'ids must be a string array',
    })
  }

  if (ids.length === 0) {
    return NextResponse.json([])
  }

  const data = await sanityClientFetch(
    COLLECTIONS_QUERY,
    { ids },
    { tag: 'collections-route', stega: false },
  )
  return NextResponse.json(data)
}
