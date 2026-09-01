import { AUDIO_QUEUE_ITEMS_QUERY } from '@/app/(sanity)/groq/audio-queue-items-query'
import { client } from '@/app/(sanity)/lib/client'
import { NextResponse } from 'next/server'

/**
 * Plain API route rather than a server action: `useAudioQueue` is a shared
 * hook reachable from both the App Router and the legacy Pages Router, and
 * only App Router pages get the RSC compilation that strips a server
 * action's real (server-only) implementation out of the client bundle. A
 * Pages Router page importing a `sanityFetch`-based server action bundles
 * `defineLive` itself into client JS, which throws at runtime. A `fetch()`
 * call to a URL has no such coupling.
 */
export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return new Response(undefined, { status: 400, statusText: 'invalid request body' })
  }

  const ids = (body as { ids?: unknown })?.ids
  if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string')) {
    return new Response(undefined, { status: 400, statusText: 'ids must be a string array' })
  }

  if (ids.length === 0) {
    return NextResponse.json([])
  }

  const items = await client.fetch(AUDIO_QUEUE_ITEMS_QUERY, { ids })
  return NextResponse.json(items)
}
