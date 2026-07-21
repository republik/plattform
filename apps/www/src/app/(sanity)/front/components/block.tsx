import { TeaserItem } from '@/app/(sanity)/components/page-builder/teaser-item'
import { TeaserList } from '@/app/(sanity)/components/page-builder/teaser-list'
import { FrontBuilderBlock } from '@/app/(sanity)/groq/front-query'

export function Block({
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

    default:
      return null
  }
}
