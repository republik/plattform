import { TeaserListBlockFragmentType } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import { TeaserFeedServer } from '@/app/(sanity)/pages/[...path]/components/blocks/teaser-feed-server'
import { stegaClean } from 'next-sanity'
import { Carousel } from './carousel'

export async function TeaserList({
  teaserList,
  documentId,
  blockKey,
}: {
  teaserList: TeaserListBlockFragmentType
  documentId: string
  blockKey: string
}) {
  const appearance = stegaClean(teaserList.appearance)

  // TODO: GRID

  if (appearance === 'FEED')
    return (
      <TeaserFeedServer
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
