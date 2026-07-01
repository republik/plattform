import { ArticlePortableText } from '@/app/(sanity)/components/portable-text/renderArticle'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { defineQuery } from 'next-sanity'

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

  console.log('article', article.content)

  return <ArticlePortableText value={article.content} />
}
