import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '../../../../../lib/apollo/client'
import {
  SitemapByYearDocument,
  type SitemapByYearQuery,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { parseJSONObject } from '../../../../../../lib/safeJSON'

const BASE_URL = process.env.PUBLIC_BASE_URL
const SCHEMA_PUBLISHER = process.env.NEXT_PUBLIC_SCHEMA_PUBLISHER

const publisher = parseJSONObject(SCHEMA_PUBLISHER)

function generateNewsSiteMap(
  articles: (NonNullable<SitemapByYearQuery['search']['nodes'][0]['entity']> & {
    __typename: 'Document'
  })[],
) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${articles
  .map(({ meta }) => {
    return `
  <url>
    <loc>${BASE_URL}${meta.path}</loc>
    <lastmod>${new Date(
      meta.lastPublishedAt || meta.publishDate!,
    ).toISOString()}</lastmod>
    <news:news>
      <news:publication>
        <news:name>${publisher.name}</news:name>
        <news:language>${publisher.knowsLanguage}</news:language>
      </news:publication>
      <news:publication_date>${meta.publishDate}</news:publication_date>
      <news:title>${meta.title}</news:title>
    </news:news>
  </url>`
  })
  .join('')}
</urlset>`
}

export async function GET(request: NextRequest, props: { params: Promise<{ year: string }> }) {
  const params = await props.params;
  const { year } = params

  if (!year || isNaN(parseInt(year))) {
    return NextResponse.json(
      { error: 'Invalid year parameter' },
      { status: 400 },
    )
  }
  const yearString = String(parseInt(year))
  const client = await getClient()

  const fromDate = new Date(parseInt(year), 0, 1) // January 1st of the year
  const toDate = new Date(parseInt(year) + 1, 0, 1) // January 1st of the next year

  try {
    const { data, errors } = await client.query<SitemapByYearQuery>({
      query: SitemapByYearDocument,
      variables: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      },
    })

    if (errors) {
      console.error(`[news-sitemap-${yearString}]`, errors)
      return NextResponse.json({ error: 'GraphQL error' }, { status: 500 })
    }

    const {
      search: { nodes },
    } = data

    const articles = nodes
      .map(({ entity }) => entity)
      .filter(
        (
          entity,
        ): entity is NonNullable<typeof entity> & { __typename: 'Document' } =>
          entity?.__typename === 'Document',
      )

    const sitemap = generateNewsSiteMap(articles)

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error(
      `[news-sitemap-${yearString}]`,
      'Failed to fetch articles:',
      error,
    )
    return NextResponse.json(
      { error: 'Failed to generate sitemap' },
      { status: 500 },
    )
  }
}
