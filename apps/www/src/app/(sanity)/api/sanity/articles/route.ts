import { ARTICLES_BY_IDS_QUERY } from '@/app/(sanity)/groq/articles-by-ids-query'
import { client } from '@/app/(sanity)/lib/client'
import { draftMode } from 'next/headers'
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

  const data = await client.fetch(
    ARTICLES_BY_IDS_QUERY,
    { ids },
    { stega: false, tag: 'articles-route' },
  )
  return NextResponse.json(data)
}
