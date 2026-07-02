import { sanityFetch } from '@/app/(sanity)/lib/live'
import { EditorBlock } from '@/app/(sanity)/pages/[...path]/components/blocks/editor-block'
import { css } from '@republik/theme/css'
import { defineQuery } from 'next-sanity'
import { CallToAction } from './blocks/call-to-action'
import { Menu } from './blocks/menu'
import { TeaserList } from './blocks/teaser-list'
import { TitleBlock } from './blocks/title-block'

export type PageBuilderBlock = {
  _key: string
  _type: string
  appearance?: string
}

const PAGE_CONTENT_QUERY = defineQuery(
  `*[_type == "page" && slug.current == $slug][0]{
    _id,
    pageBuilder[]{
      _key,
      _type,
      appearance
    }
  }`,
)

export async function PageBuilder({ slug }: { slug: string }) {
  const { data: page } = await sanityFetch({
    query: PAGE_CONTENT_QUERY,
    params: { slug },
  })

  if (!page) {
    return null
  }

  const { pageBuilder } = page

  if (!pageBuilder?.length) {
    return null
  }

  return (
    <>
      {pageBuilder.map((block) => (
        <Block key={block._key} block={block} documentId={page._id} />
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
  const { _type, _key } = block

  switch (_type) {
    case 'editorBlock':
      return <EditorBlock blockKey={_key} documentId={documentId} />

    case 'teaserList':
      return <TeaserList block={block} documentId={documentId} />

    case 'titleBlock':
      return <TitleBlock block={block} />

    case 'callToAction':
      return <CallToAction block={block} />

    case 'menu':
      return <Menu block={block} />

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
