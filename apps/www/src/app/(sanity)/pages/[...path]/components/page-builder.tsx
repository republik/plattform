import { PagePortableText } from '@/app/(sanity)/components/portable-text/renderPage'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import type { PAGE_CONTENT_QUERY_RESULT } from '@/sanity.types'
import { css } from '@republik/theme/css'
import { defineQuery } from 'next-sanity'
import { CallToAction, callToActionFragment } from './blocks/call-to-action'
import { Menu, menuFragment } from './blocks/menu'
import { TeaserItem, teaserItemFragment } from './blocks/teaser-item'
import { TeaserList, teaserListFragment } from './blocks/teaser-list'
import { TitleBlock, titleBlockFragment } from './blocks/title-block'

type Page = NonNullable<PAGE_CONTENT_QUERY_RESULT>
type PageBuilderBlock = NonNullable<Page['pageBuilder']>[number]

const PAGE_CONTENT_QUERY = defineQuery(
  `*[_type == "page" && slug.current == $slug][0]{
    _id,
    pageBuilder[]{
      ...,
      ${titleBlockFragment},
      ${menuFragment},
      ${callToActionFragment},
      ${teaserItemFragment},
      ${teaserListFragment}
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
        <Block key={block._key} block={block} />
      ))}
    </>
  )
}

function Block({ block }: { block: PageBuilderBlock }) {
  switch (block._type) {
    case 'editorBlock':
      return block.content ? <PagePortableText value={block.content} /> : null

    case 'titleBlock':
      return <TitleBlock block={block} />

    case 'teaserItem':
      return <TeaserItem block={block} />

    case 'teaserList':
      return <TeaserList block={block} />

    case 'callToAction':
      return <CallToAction block={block} />

    case 'menu':
      return <Menu block={block} />

    case 'searchBlock':
      // TODO: render search widget
      return <UnimplementedBlock block={block} />

    case 'bestOfDialogue':
      // TODO: render best-of-dialogue widget
      return <UnimplementedBlock block={block} />

    case 'meineRepublik':
      // TODO: render "Meine Republik" widget
      return <UnimplementedBlock block={block} />

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
