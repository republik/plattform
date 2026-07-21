import { CallToAction } from '@/app/(sanity)/components/page-builder/call-to-action'
import { EditorBlock } from '@/app/(sanity)/components/page-builder/editor-block'
import { Menu } from '@/app/(sanity)/components/page-builder/menu'
import { TeaserItem } from '@/app/(sanity)/components/page-builder/teaser-item'
import { TeaserList } from '@/app/(sanity)/components/page-builder/teaser-list'
import { PageBuilderBlock } from '@/app/(sanity)/groq/page-query'

export function Block({
  block,
  documentId,
}: {
  block: PageBuilderBlock
  documentId: string
}) {
  const { _key } = block

  switch (block._type) {
    case 'editorBlock':
      return <EditorBlock editorBlock={block} />

    // we need blockKey & documentId to query the teasers…
    case 'teaserList':
      return (
        <TeaserList
          teaserList={block}
          blockKey={_key}
          documentId={documentId}
        />
      )

    case 'callToAction':
      return <CallToAction cta={block} />

    case 'menu':
      return <Menu menu={block} />

    case 'teaserLarge':
      return <TeaserItem reference={block.reference} />

    default:
      return null
  }
}
