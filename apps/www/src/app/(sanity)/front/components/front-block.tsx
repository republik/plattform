import { BestOfDialogue } from '@/app/(sanity)/components/page-builder/best-of-dialogue'
import { MyRepublik } from '@/app/(sanity)/components/page-builder/my-republik'
import { TeaserItem } from '@/app/(sanity)/components/page-builder/teaser-item'
import { TeaserList } from '@/app/(sanity)/components/page-builder/teaser-list'
import { FrontBuilderBlock } from '@/app/(sanity)/groq/front-latest-query'

export function FrontBlock({
  block,
  documentId,
}: {
  block: FrontBuilderBlock
  documentId: string
}) {
  const { _key } = block

  switch (block._type) {
    // we need blockKey & documentId to query the teasers…
    case 'teaserList':
      return (
        <TeaserList
          teaserList={block}
          blockKey={_key}
          documentId={documentId}
        />
      )

    case 'teaserLarge':
      return <TeaserItem reference={block.reference} />

    case 'myRepublik':
      return <MyRepublik />

    case 'bestOfDialogue':
      return <BestOfDialogue />

    default:
      return null
  }
}
