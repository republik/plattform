import { Button } from '@/app/(sanity)/articles/[...path]/components/button'
import { Conditional } from '@/app/(sanity)/articles/[...path]/components/conditional'
import { EmbedDataWrapper } from '@/app/(sanity)/articles/[...path]/components/embed-datawrapper'
import { Html } from '@/app/(sanity)/articles/[...path]/components/html'
import { LegacyEmbedVideo } from '@/app/(sanity)/articles/[...path]/components/legacy-embed-video'
import { WebOnly } from '@/app/(sanity)/articles/[...path]/components/web-only'
import {
  Em,
  ExternalLink,
  InternalLink,
  Strong,
  Sub,
  Sup,
} from '@/app/(sanity)/components/portable-text/marks'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import {
  defineQuery,
  PortableText,
  type PortableTextComponentProps,
  type PortableTextReactComponents,
  type UnknownNodeType,
} from 'next-sanity'
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
    divider: () => <hr />,
    // This is the web, we never render emailOnly blocks :)
    emailOnly: () => null,
    webOnly: WebOnly,
    html: Html,
    embedVideo: LegacyEmbedVideo,
    // Wrap function because renderNode can't be passed to a client component
    button: ({ value }) => <Button value={value} />,
    if: ({ value }) => <Conditional value={value} />,
    ifNot: ({ value }) => <Conditional value={value} />,
    embedDataWrapper: ({ value }) => <EmbedDataWrapper value={value} />,
  },
  block: {
    heading: ({ children }) => <h2>{children}</h2>,
    note: Note,
  },
  marks: {
    strong: Strong,
    em: Em,
    sub: Sub,
    sup: Sup,
    link: ExternalLink,
    internalLink: InternalLink,
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
