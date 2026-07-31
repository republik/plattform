import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/app/(sanity)/lib/client'
import { SITEMAP_BY_YEAR_QUERY } from '@/app/(sanity)/groq/sitemap-query'
import type { SITEMAP_BY_YEAR_QUERY_RESULT } from '@/sanity.types'
import { parseJSONObject } from '@/lib/safeJSON'
import { toXML } from 'jstoxml'

const BASE_URL = process.env.PUBLIC_BASE_URL
const SCHEMA_PUBLISHER = process.env.NEXT_PUBLIC_SCHEMA_PUBLISHER

const publisher = parseJSONObject(SCHEMA_PUBLISHER)

function generateNewsSiteMap(articles: SITEMAP_BY_YEAR_QUERY_RESULT) {
  const sitemapData = {
    _name: 'urlset',
    _attrs: {
      xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
      'xmlns:news': 'http://www.google.com/schemas/sitemap-news/0.9',
    },
    _content: articles.map((article) => ({
      _name: 'url',
      _content: [
        { _name: 'loc', _content: `${BASE_URL}${article.path}` },
        {
          _name: 'lastmod',
          _content: new Date(
            article._updatedAt || article.publishDate!,
          ).toISOString(),
        },
        {
          _name: 'news:news',
          _content: [
            {
              _name: 'news:publication',
              _content: [
                { _name: 'news:name', _content: publisher.name },
                { _name: 'news:language', _content: publisher.knowsLanguage },
              ],
            },
            { _name: 'news:publication_date', _content: article.publishDate },
            { _name: 'news:title', _content: article.title },
          ],
        },
      ],
    })),
  }

  return toXML(sitemapData, {
    header: true,
    indent: '  ',
  })
}

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ year: string }> },
) {
  const params = await props.params
  const { year } = params

  if (!year || isNaN(parseInt(year))) {
    return NextResponse.json(
      { error: 'Invalid year parameter' },
      { status: 400 },
    )
  }
  const yearString = String(parseInt(year))

  const fromDate = new Date(parseInt(year), 0, 1) // January 1st of the year
  const toDate = new Date(parseInt(year) + 1, 0, 1) // January 1st of the next year

  try {
    const documents = await client.fetch(SITEMAP_BY_YEAR_QUERY, {
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    })

    // News sitemaps should only include articles, not generic pages
    const articles = documents.filter(
      (document) => document._type === 'article',
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
