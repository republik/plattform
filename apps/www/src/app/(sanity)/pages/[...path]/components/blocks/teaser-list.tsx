import { TeaserListBlockFragmentType } from '@/app/(sanity)/groq/teaser-list-block-fragment'
import { Carousel } from '@/app/(sanity)/pages/[...path]/components/blocks/carousel'
import { TeaserLoaderServer } from '@/app/(sanity)/pages/[...path]/components/blocks/teaser-loader-server'
import { stegaClean } from 'next-sanity'

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

  const needsLoader = ['GRID', 'FEED'].includes(appearance)

  if (needsLoader)
    return (
      <TeaserLoaderServer
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
