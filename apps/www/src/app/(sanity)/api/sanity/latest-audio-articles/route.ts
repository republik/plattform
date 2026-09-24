import { LATEST_AUDIO_ARTICLES_QUERY } from '@/app/(sanity)/groq/audio-queue-items-query'
import { sanityClientFetch } from '@/app/(sanity)/lib/fetch'
import { NextResponse } from 'next/server'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 50

/**
 * Plain API route rather than a server action, for the same reason as
 * `../audio-queue-items/route.ts`: the audio player is reachable from both
 * the App Router and the legacy Pages Router, and only App Router pages get
 * the RSC compilation that keeps `defineLive` out of the client bundle.
 */
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams

  const parsedLimit = Number(params.get('limit'))
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(Math.trunc(parsedLimit), 1), MAX_LIMIT)
    : DEFAULT_LIMIT

  const data = await sanityClientFetch(
    LATEST_AUDIO_ARTICLES_QUERY,
    {
      limit,
      lastPublishDate: params.get('lastPublishDate'),
      lastId: params.get('lastId'),
    },
    { stega: false, tag: 'latest-audio-articles-route' },
  )

  return NextResponse.json(data ?? [])
}
