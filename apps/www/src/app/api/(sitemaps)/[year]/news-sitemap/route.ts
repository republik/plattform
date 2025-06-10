import { NextRequest, NextResponse } from 'next/server'
import { gql } from '@apollo/client'
import { getClient } from '../../../../../lib/apollo/client'
import { parseJSONObject } from '../../../../../../lib/safeJSON'

const BASE_URL = process.env.PUBLIC_BASE_URL || 'https://www.republik.ch'
const SCHEMA_PUBLISHER = process.env.NEXT_PUBLIC_SCHEMA_PUBLISHER

const publisher = parseJSONObject(SCHEMA_PUBLISHER)

function generateNewsSiteMap(articles: any[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${articles
  .map(({ meta }) => {
    return `
  <url>
    <loc>${BASE_URL}${meta.path}</loc>
    <news:news>
      <news:publication>
        <news:name>${publisher.name}</news:name>
        <news:language>${publisher.knowsLanguage}</news:language>
      </news:publication>
      <news:publication_date>${meta.publishDate}</news:publication_date>
      <news:title>${meta.seoTitle || meta.twitterTitle || meta.title}</news:title>
    </news:news>
  </url>`
  })
  .join('')}
</urlset>`
}

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string } },
) {
  const { year } = params
  
  if (!year || isNaN(parseInt(year))) {
    return NextResponse.json({ error: 'Invalid year parameter' }, { status: 400 })
  }
  const yearString = String(parseInt(year))

  if (!publisher.name || !publisher.knowsLanguage) {
    console.warn(
      '[news-sitemap]',
      'SCHEMA_PUBLISHER incomplete',
      `publisher.name=${publisher.name}`,
      `publisher.knowsLanguage=${publisher.knowsLanguage}`,
    )
    return NextResponse.json(
      { error: 'Publisher configuration incomplete' },
      { status: 500 },
    )
  }

  const client = getClient()

  const fromDate = new Date(parseInt(year), 0, 1) // January 1st of the year
  const toDate = new Date(parseInt(year) + 1, 0, 1) // January 1st of the next year

  try {
    const { data, errors } = await client.query({
      query: gql`
        query newsSitemapByYear($from: DateTime!, $to: DateTime!) {
          search(
            filter: {
              type: Document
              template: "article"
              publishedAt: { from: $from to: $to }
            }
            first: 50000
            sort: { key: publishedAt, direction: DESC }
          ) {
            totalCount
            nodes {
              entity {
                ... on Document {
                  meta {
                    path
                    seoTitle
                    twitterTitle
                    title
                    publishDate
                  }
                }
              }
            }
          }
        }
      `,
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

    const articles = nodes.map(({ entity }) => entity)

    const sitemap = generateNewsSiteMap(articles)

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error(`[news-sitemap-${yearString}]`, 'Failed to fetch articles:', error)
    return NextResponse.json(
      { error: 'Failed to generate sitemap' },
      { status: 500 },
    )
  }
} 