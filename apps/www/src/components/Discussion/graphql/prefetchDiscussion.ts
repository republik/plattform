import { ApolloClient, NormalizedCacheObject } from '@apollo/client'
import { ParsedUrlQuery } from 'querystring'
import {
  DISCUSSION_QUERY,
  DiscussionQuery,
  DiscussionQueryVariables,
} from './queries/DiscussionQuery.graphql'

export const DEFAULT_DISCUSSION_ORDER = 'AUTO'
export const DISCUSSION_DEPTH = 3

type DiscussionQueryOptions = {
  query: ParsedUrlQuery
  discussionPath: string
  parentId?: string
  includeParent?: boolean
}

const firstValue = (value: string | string[]): string =>
  Array.isArray(value) ? value[0] : value

/**
 * Single source of truth for the variables of the discussion query, shared
 * between `DiscussionContextProvider` and `prefetchDiscussion`: a server-seeded
 * cache entry is only picked up by the client query if every variable matches.
 */
export function getDiscussionQueryVariables({
  query,
  discussionPath,
  parentId,
  includeParent,
}: DiscussionQueryOptions): DiscussionQueryVariables {
  return {
    discussionPath,
    orderBy: firstValue(query.order) || DEFAULT_DISCUSSION_ORDER,
    activeTag: firstValue(query.tag),
    focusId: firstValue(query.focus),
    depth: DISCUSSION_DEPTH,
    parentId,
    includeParent,
  }
}

/**
 * Seeds the SSR Apollo cache with the discussion so that the comments, the
 * discussion title, the meta tags and the `DiscussionForumPosting` JSON-LD are
 * part of the server-rendered HTML instead of appearing only after hydration.
 *
 * Returns the query data, or `undefined` if the request failed. Callers can use
 * that to tell a discussion that doesn't exist (`discussion: null`, a valid
 * result) from one that couldn't be loaded — the latter must not be turned into
 * a 404, the components handle it the same way they do during a client-side
 * navigation.
 */
export async function prefetchDiscussion(
  client: ApolloClient<NormalizedCacheObject>,
  options: DiscussionQueryOptions,
): Promise<DiscussionQuery | undefined> {
  const result = await client
    .query<DiscussionQuery, DiscussionQueryVariables>({
      query: DISCUSSION_QUERY,
      variables: getDiscussionQueryVariables(options),
    })
    .catch((error) => {
      console.warn(
        `Failed to prefetch discussion "${options.discussionPath}"`,
        error,
      )
      return undefined
    })

  return result?.data
}
