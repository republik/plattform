import { Carousel } from '@/app/(sanity)/components/page-builder/carousel'
import { TeaserFeedServer } from '@/app/(sanity)/components/page-builder/teaser-feed-server'
import { TeaserGrid } from '@/app/(sanity)/components/page-builder/teaser-grid'
import { TeaserListBlockFragmentType } from '@/app/(sanity)/groq/teaser-list-block-fragment'

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

  console.log({ teaserList })

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
