import { CallToAction } from '@/app/(sanity)/pages/[...path]/components/blocks/call-to-action'
import { EditorBlock } from '@/app/(sanity)/pages/[...path]/components/blocks/editor-block'
import { TeaserItem } from '@/app/(sanity)/pages/[...path]/components/blocks/teaser-item'
import { TeaserList } from '@/app/(sanity)/pages/[...path]/components/blocks/teaser-list'
import type { PAGE_QUERY_RESULT } from '@/sanity.types'
import { css } from '@republik/theme/css'

export type PageBuilderBlock = NonNullable<
  NonNullable<PAGE_QUERY_RESULT>['pageBuilder']
>[number]

export function PageBuilder({
  blocks,
  documentId,
}: {
  blocks: PageBuilderBlock[]
  documentId: string
}) {
  return (
    <>
      {blocks.map((block) => (
        <Block key={block._key} block={block} documentId={documentId} />
      ))}
    </>
  )
}

function Block({
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

    case 'teaserItem':
      return <TeaserItem blockKey={_key} documentId={documentId} />

    /*case 'callToAction':
      return <CallToAction block={block} />

    case 'menu':
      return <Menu menu={block} />

    /*case 'teaserItem':
      return <TeaserItem block={block} />

    case 'searchBlock':
      return <UnimplementedBlock block={block} />

    case 'bestOfDialogue':
      return <UnimplementedBlock block={block} />

    case 'meineRepublik':
      return <UnimplementedBlock block={block} />*/

    default:
      return <UnimplementedBlock block={block} />
  }
}

function UnimplementedBlock({ block }: { block: PageBuilderBlock }) {
  if (process.env.NODE_ENV === 'production') {
    return null
  }
  return (
    <pre
      className={css({
        textStyle: 'sans',
        fontSize: 's',
        background: 'hover',
        color: 'text',
        p: 4,
        my: 4,
        borderRadius: 4,
        overflowX: 'auto',
      })}
    >
      {`<${block._type}> not implemented yet\n\n`}
      {JSON.stringify(block, null, 2)}
    </pre>
  )
}
