import {
  Em,
  Strong,
  Sub,
  Sup,
} from '@/app/(sanity)/articles/[...path]/components/typography'
import { linkStyle } from '@/app/(sanity)/articles/[...path]/styles'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import {
  defineQuery,
  PortableText,
  PortableTextComponentProps,
  PortableTextReactComponents,
  UnknownNodeType,
} from 'next-sanity'
import Link from 'next/link'
import { BlockQuote } from './block-quote'
import { EditorialImage } from './editorial-image'
import { ImageGroup } from './image-group'
import { InfoBox } from './infobox'
import { Note } from './note'
import { PullQuote } from './pull-quote'

const ARTICLE_CONTENT_QUERY = defineQuery(
  `*[_type == "article" && slug.current == $slug][0]{
    _id,
    content[]{
        ...,
        markDefs[]{
          ...,
          _type == "internalLink" => {
            "slug": @.reference->slug
          }
        }
    }
  }`,
)

function UnknownType({
  value,
  isInline,
}: PortableTextComponentProps<UnknownNodeType>) {
  return (
    <span
      style={
        isInline
          ? { background: 'hotpink' }
          : {
              background: 'hotpink',
              display: 'block',
              padding: 30,
              overflowWrap: 'anywhere',
            }
      }
    >
      {JSON.stringify(value, null, 2)}
    </span>
  )
}

const ptComponents: Partial<PortableTextReactComponents> = {
  unknownType: UnknownType,

  types: {
    blockQuote: BlockQuote,
    pullQuote: PullQuote,
    editorialImage: EditorialImage,
    imageGroup: ImageGroup,
    infoBox: InfoBox,
  },
  block: {
    // normal: EditorialParagraph,
    // h2: EditorialSubhead,
    note: Note,
  },
  marks: {
    strong: Strong,
    em: Em,
    sub: Sub,
    sup: Sup,
    link: ({ text, value }) => (
      <a
        href={value.href}
        target='_blank'
        rel='noreferrer'
        className={linkStyle}
      >
        {text}
      </a>
    ),
    internalLink: ({ text, value }) => {
      const href = value.slug?.current
      return href ? (
        <Link href={href} className={linkStyle}>
          {text}
        </Link>
      ) : (
        text
      )
    },
  },
}

export async function ArticleContent({ slug }: { slug: string }) {
  const { data: article } = await sanityFetch({
    query: ARTICLE_CONTENT_QUERY,
    params: { slug },
  })

  console.log('article', article.content)

  return <PortableText value={article.content} components={ptComponents} />
}
