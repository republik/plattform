import { sanityFetch } from '@/app/(sanity)/lib/live'
import { defineQuery, PortableText } from 'next-sanity'
import Link from 'next/link'
import { EditorialImage } from './editorial-image'
import { InfoBox } from './infobox'

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

export async function ArticleContent({ slug }: { slug: string }) {
  const { data: article } = await sanityFetch({
    query: ARTICLE_CONTENT_QUERY,
    params: { slug },
  })

  return (
    <PortableText
      value={article.content}
      components={{
        unknownType: ({ value }) => (
          <div style={{ background: 'hotpink', padding: 30 }}>
            {JSON.stringify(value)}
          </div>
        ),
        types: {
          editorialImage: EditorialImage,
          infoBoxBlock: InfoBox,
        },
        marks: {
          link: ({ text, value }) => (
            <a href={value.href} target='_blank' rel='noreferrer'>
              {text}
            </a>
          ),
          internalLink: ({ text, value }) => (
            <Link href={value.slug?.current}>{text}</Link>
          ),
        },
      }}
    />
  )
}
