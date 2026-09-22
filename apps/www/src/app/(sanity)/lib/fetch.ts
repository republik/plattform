import { client } from '@/app/(sanity)/lib/client'
import { sanityFetch as liveFetch } from '@/app/(sanity)/lib/live'
import type {
  ClientReturn,
  QueryParams,
  ResponseQueryOptions,
} from 'next-sanity'
import { draftMode } from 'next/headers'

const publishedClient = client.withConfig({
  stega: false,
  perspective: 'published',
})

export async function sanityClientFetch<const QueryString extends string>(
  query: QueryString,
  params?: QueryParams,
  options?: ResponseQueryOptions,
): Promise<ClientReturn<QueryString>> {
  const draft = (await draftMode()).isEnabled

  if (draft) {
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
}
