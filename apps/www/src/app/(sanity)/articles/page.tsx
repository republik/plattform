import { InlinePortableText } from '@/app/(sanity)/components/inline-portable-text'
import { sanityFetch } from '@/app/(sanity)/lib/live'
import { defineQuery } from 'next-sanity'
import Link from 'next/link'

const ARTICLES_QUERY = defineQuery(`
  *[_type == "article" && defined(slug.current)][0...100]{
    "slug": slug.current,
    title
  }`)

export default async function FeedPage() {
  const { data: articles } = await sanityFetch({
    query: ARTICLES_QUERY,
  })

  return (
    <div>
      {articles?.map((article) => (
        <div key={article.slug}>
          <h2>
            <Link href={`/articles/${article.slug}`}>
              <InlinePortableText value={article.title} />
            </Link>
          </h2>
        </div>
      ))}
    </div>
  )
}
