'use server'

import { AUDIO_QUEUE_ITEMS_QUERY } from '@/app/(sanity)/groq/audio-queue-items-query'
import { sanityFetch } from '@/app/(sanity)/lib/live'

export async function getAudioQueueItemsByIds(ids: string[]) {
  if (!ids.length) return []
  const { data } = await sanityFetch({
    query: AUDIO_QUEUE_ITEMS_QUERY,
    params: { ids },
  })
  return data ?? []
}
