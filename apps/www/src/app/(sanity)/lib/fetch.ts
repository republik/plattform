import { client } from '@/app/(sanity)/lib/client'
import { sanityFetch as liveFetch } from '@/app/(sanity)/lib/live'
import * as Sentry from '@sentry/nextjs'
import type {
  ClientReturn,
  QueryParams,
  ResponseQueryOptions,
} from 'next-sanity'
import { draftMode, headers } from 'next/headers'

const publishedClient = client.withConfig({
  stega: false,
  perspective: 'published',
})

/**
 * Draft content is only fetched on /preview routes with draft mode enabled. See proxy.ts
 */
async function isPreviewRequest() {
  if (!(await draftMode()).isEnabled) {
    return false
  }
  // Only read headers once draft mode is enabled, so published pages can stay static
  return (await headers()).get('x-republik-preview') === '1'
}

export async function sanityClientFetch<const QueryString extends string>(
  query: QueryString,
  params?: QueryParams,
  options?: ResponseQueryOptions,
): Promise<ClientReturn<QueryString>> {
  const isPreview = await isPreviewRequest()
  try {
    if (isPreview) {
      const { data } = await liveFetch({
        query,
        params,
        perspective: 'drafts',
        requestTag: options?.tag,
      })
      return data
    }

    return publishedClient.fetch(query, params, {
      next: { revalidate: 60 },
      ...options,
    })
  } catch (e) {
    Sentry.captureException(e, {
      tags: {
        context: 'sanityClientFetch',
        requestTag: options?.tag,
        isDraftMode: isPreview,
      },
      extra: { query, params },
    })
    console.error('Sanity fetch failed', e)
  }
}
