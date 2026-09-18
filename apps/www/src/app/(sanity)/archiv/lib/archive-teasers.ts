import type { TeaserLargeFragmentType } from '@/app/(sanity)/groq/teaser-large-fragment'
import { stegaClean } from 'next-sanity'

/**
 * One teaser per article, oldest first.
 *
 * A piece can be promoted to the front more than once, which leaves several
 * teaserLarge documents pointing at it. The query hands them over newest-first,
 * so the first one seen wins.
 */
export function dedupeAndSortTeasers(
  teasers: TeaserLargeFragmentType[],
): TeaserLargeFragmentType[] {
  const byTargetId = new Map<string, TeaserLargeFragmentType>()

  for (const teaser of teasers) {
    // Teasers pointing at a page or external link have no date to sort by.
    if (!teaser.targetId || !teaser.publishDate) continue
    if (!byTargetId.has(teaser.targetId))
      byTargetId.set(teaser.targetId, teaser)
  }

  return [...byTargetId.values()].sort((a, b) =>
    stegaClean(a.publishDate!).localeCompare(stegaClean(b.publishDate!)),
  )
}
