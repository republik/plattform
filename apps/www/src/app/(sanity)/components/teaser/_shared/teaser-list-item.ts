import { stegaClean } from 'next-sanity'
import type { TeaserSmallDocumentFragmentType } from '../../../groq/teaser-small-document-fragment'
import type { TeaserSmallFragmentType } from '../../../groq/teaser-small-fragment'

// An item of a teaser list: an article/page teaser or a standalone teaser
// document (both projected to near-identical shapes by their fragments).
export type TeaserListItemType =
  | TeaserSmallFragmentType
  | TeaserSmallDocumentFragmentType

// Raw list items can also be TypeGen's empty {} placeholder for an unmatched
// conditional projection; narrow it away with isTeaserListItem.
type RawTeaserListItem = TeaserListItemType | Record<string, never>

function isTeaserListItem(item: RawTeaserListItem): item is TeaserListItemType {
  return '_id' in item
}

export function upcomingTeaser(teaser: TeaserListItemType): boolean {
  return teaser._type === 'teaserSmall' && teaser.upcomingOnly === true
}

export function isExpiredUpcomingTeaser(teaser: TeaserListItemType): boolean {
  return (
    teaser._type === 'teaserSmall' &&
    teaser.upcomingOnly === true &&
    !!stegaClean(teaser.targetPublishDate)
  )
}

export function getNotExpiredTeasers(
  teasers?: RawTeaserListItem[] | null,
): TeaserListItemType[] {
  return (teasers ?? [])
    .filter(isTeaserListItem)
    .filter((teaser) => !isExpiredUpcomingTeaser(teaser))
}
