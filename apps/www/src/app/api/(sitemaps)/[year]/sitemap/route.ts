import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '../../../../../lib/apollo/client'
import { SitemapByYearDocument, type SitemapByYearQuery } from '#graphql/republik-api/__generated__/gql/graphql'
  
const BASE_URL = process.env.PUBLIC_BASE_URL

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string } },
) {
  const year = parseInt(params.year)
  const client = getClient()

  const fromDate = new Date(year, 0, 1) // January 1st of the year
  const toDate = new Date(year + 1, 0, 1) // January 1st of the next year

  try {
    const { data, error } = await client.query<SitemapByYearQuery>({
      query: SitemapByYearDocument,
      variables: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      },
    })

    if (error) {
      console.error(`[sitemap-${year}]`, error)
      return NextResponse.json(
        { error: 'Failed to fetch data' },
        { status: 500 },
      )
    }

    const {
      search: { nodes },
    } = data

    const articles = nodes
      .map(({ entity }) => entity)
      .filter((entity): entity is NonNullable<typeof entity> & { __typename: 'Document' } => 
        entity?.__typename === 'Document'
      )

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${articles
      .map(
        (article) => `  <url>
        <loc>${BASE_URL}${article.meta.path}</loc>
        <lastmod>${new Date(
          article.meta.lastPublishedAt ||
            article.meta.publishDate,
        ).toISOString()}</lastmod>
      </url>`,
      )
      .join('\n')}
    </urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
  } catch (error) {
    console.error(`[sitemap-${year}]`, 'Failed to fetch articles:', error)
    return NextResponse.json(
      { error: 'Failed to generate sitemap' },
      { status: 500 },
    )
  }
}
