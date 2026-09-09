import { client } from '@/app/(sanity)/lib/client'
import {
  ARTICLES_BY_AUTHOR_PAGE_SIZE,
  ARTICLES_BY_AUTHOR_QUERY,
} from '@/app/(sanity)/groq/articles-by-author-query'
import type { ARTICLES_BY_AUTHOR_QUERY_RESULT } from '@/sanity.types'

/** Where the next page resumes: the sort key of the last item shown. */
export type ContributorArticlesCursor = {
  publishDate: string
  id: string
}

export type ContributorArticlesPage = {
  teasers: NonNullable<ARTICLES_BY_AUTHOR_QUERY_RESULT>
  hasMore: boolean
  cursor?: ContributorArticlesCursor
}

/** Query params for a page, with the nulls the first page needs. */
export function contributorArticlesParams(
  userId: string,
  cursor?: ContributorArticlesCursor,
) {
  return {
    userId,
    lastPublishDate: cursor?.publishDate ?? null,
    lastId: cursor?.id ?? null,
    // One over the page size: the extra document is the next-page probe.
    limit: ARTICLES_BY_AUTHOR_PAGE_SIZE + 1,
  }
}

/**
 * Turns a raw query result into a page: drops the probe document, reports
 * whether it was there, and hands back the cursor to resume from.
 *
 * Shared by the server component and the browser so the two cannot disagree
 * about what a page is.
 */
export function toContributorArticlesPage(
  data: ARTICLES_BY_AUTHOR_QUERY_RESULT,
): ContributorArticlesPage {
  // Null when no contributor carries the requested userId.
  const rows = data ?? []
  const teasers = rows.slice(0, ARTICLES_BY_AUTHOR_PAGE_SIZE)
  const last = teasers.at(-1)

  return {
    teasers,
    hasMore: rows.length > ARTICLES_BY_AUTHOR_PAGE_SIZE,
    // Both halves are required, so an article without a publishDate ends the
    // feed rather than restarting it from the top. The query filters those out
    // anyway; this only satisfies the nullable generated type.
    cursor: last?.publishDate
      ? { publishDate: last.publishDate, id: last._id }
      : undefined,
  }
}

/**
 * Reads a page straight from Sanity's CDN. The dataset is public, so the
 * browser can query it without a token and no API route has to stand in the
 * middle — which is what lets the pages-router profile use this feed at all.
 *
 * Server components should use `sanityFetch` instead: it carries the draft
 * perspective and live-content tags this does not.
 */
export async function fetchContributorArticlesPage(
  userId: string,
  cursor?: ContributorArticlesCursor,
): Promise<ContributorArticlesPage> {
  const data = await client.fetch<ARTICLES_BY_AUTHOR_QUERY_RESULT>(
    ARTICLES_BY_AUTHOR_QUERY,
    contributorArticlesParams(userId, cursor),
  )

  return toContributorArticlesPage(data)
}
