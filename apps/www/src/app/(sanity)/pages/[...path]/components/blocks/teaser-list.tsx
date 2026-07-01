import type { PAGE_CONTENT_QUERY_RESULT } from '@/sanity.types'
import { css } from '@republik/theme/css'
import { stegaClean } from 'next-sanity'
import { Teaser, teaserFragment, type TeaserData } from './teaser'
import { TeaserFeed } from './teaser-feed'

type PageBuilderBlock = NonNullable<
  NonNullable<PAGE_CONTENT_QUERY_RESULT>['pageBuilder']
>[number]

export type TeaserListBlock = Extract<PageBuilderBlock, { _type: 'teaserList' }>

/** GROQ projection for the `teaserList` block, resolving its `source`. */
export const teaserListFragment = /* groq */ `
  _type == "teaserList" => {
    "items": select(
      source.sourceType == "MANUAL" => source.items[]->{
        ${teaserFragment}
      },
      source.sourceType == "COLLECTION" => *[
        _type == "article" &&
        ^.source.collection._ref in articleCollections[]._ref
      ] | order(publishDate desc) {
        ${teaserFragment}
      },
      []
    )
  }
`

/** Renders a list of teasers resolved from a collection or manual selection. */
export function TeaserList({ block }: { block: TeaserListBlock }) {
  const maxItems = block.maxItems
  const items: TeaserData[] =
    maxItems != null ? (block.items ?? []).slice(0, maxItems) : (block.items ?? [])

  if (!items.length) {
    return null
  }

  const appearance = stegaClean(block.appearance)

  // A feed renders the first batch and reveals the rest on click.
  if (appearance === 'FEED') {
    return <TeaserFeed items={items} counter={block.counter} />
  }

  const isGrid = appearance === 'GRID'

  return (
    <div
      className={css({
        display: isGrid ? 'grid' : 'block',
        gridTemplateColumns: isGrid
          ? { base: '1fr', md: 'repeat(2, 1fr)' }
          : undefined,
        columnGap: isGrid ? 8 : undefined,
      })}
    >
      {items.map((teaser, index) => (
        <Teaser
          key={teaser._id}
          teaser={teaser}
          counter={block.counter ? index + 1 : undefined}
        />
      ))}
    </div>
  )
}
