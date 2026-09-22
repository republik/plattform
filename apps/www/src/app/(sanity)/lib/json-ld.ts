import type { ArticleDocumentType } from '@/app/(sanity)/groq/document-query'
import { getSocialImage } from '@/app/(sanity)/lib/social-image'
import { SCHEMA_PUBLISHER } from '@/lib/constants'
import { parseJSONObject } from '@/lib/safeJSON'
import { stegaClean } from 'next-sanity'

const publisher = parseJSONObject(SCHEMA_PUBLISHER)

type Article = NonNullable<ArticleDocumentType>
type Contributor = NonNullable<Article['contributors']>[number]

// Contributors without a `kind` are the main authors (same convention as the byline).
const isAuthor = ({ kind }: Contributor) => !kind || /text/i.test(kind)

const mapContributor = ({ name, slug }: Contributor) => ({
  '@type': 'Person',
  name,
  url: slug
    ? new URL(`/~${slug}`, process.env.NEXT_PUBLIC_BASE_URL).toString()
    : undefined,
})

/**
 * Linked data (schema.org) for an article, rendered as `application/ld+json`.
 * Stega-encoded characters are stripped, they have no business in metadata.
 */
export function getArticleJsonLd(article: Article) {
  const url = new URL(article.slug, process.env.NEXT_PUBLIC_BASE_URL).toString()
  const headline = article.seo?.title || article.plainTitle
  const contributors = article.contributors ?? []
  const authors = contributors.filter(isAuthor)
  const otherContributors = contributors.filter((c) => !isAuthor(c))
  const image = getSocialImage(article.seo, article.slug)

  return stegaClean({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    headline,
    description: article.seo?.description || article.plainDescription,
    alternativeHeadline:
      headline !== article.plainTitle ? article.plainTitle : undefined,
    image: image ? [image.url] : undefined,
    datePublished: article.publishDate ?? undefined,
    dateModified: article._updatedAt,
    author: authors.length ? authors.map(mapContributor) : undefined,
    contributor: otherContributors.length
      ? otherContributors.map(mapContributor)
      : undefined,
    // skip empty objects or if name is missing
    publisher: publisher.name ? publisher : undefined,
    isAccessibleForFree: true,
  })
}
