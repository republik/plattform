import { TeaserListBlockFragmentType } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import { Carousel } from '@/app/(sanity)/pages/[...path]/components/blocks/carousel'
import { TeaserFeedServer } from '@/app/(sanity)/pages/[...path]/components/blocks/teaser-feed-server'
import { TeaserGrid } from '@/app/(sanity)/pages/[...path]/components/blocks/teaser-grid'

export async function TeaserList({
  teaserList,
  documentId,
  blockKey,
}: {
  teaserList: TeaserListBlockFragmentType
  documentId: string
  blockKey: string
}) {
  const appearance = teaserList.appearance

  if (appearance === 'FEED')
    return (
      <TeaserFeedServer
        teaserList={teaserList}
        documentId={documentId}
        blockKey={blockKey}
      />
    )

  if (appearance === 'GRID')
    return (
      <TeaserGrid
        teaserList={teaserList}
        documentId={documentId}
        blockKey={blockKey}
      />
    )

  if (appearance === 'CAROUSEL')
    return (
      <Carousel
        teaserList={teaserList}
        documentId={documentId}
        blockKey={blockKey}
      />
    )

  return null
}
