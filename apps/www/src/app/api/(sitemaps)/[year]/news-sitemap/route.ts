import { NextRequest, NextResponse } from 'next/server'
import { getClient } from '../../../../../lib/apollo/client'
import {
  SitemapByYearDocument,
  type SitemapByYearQuery,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { parseJSONObject } from '../../../../../../lib/safeJSON'
import { toXML } from 'jstoxml'

const BASE_URL = process.env.PUBLIC_BASE_URL
const SCHEMA_PUBLISHER = process.env.NEXT_PUBLIC_SCHEMA_PUBLISHER

const publisher = parseJSONObject(SCHEMA_PUBLISHER)

function generateNewsSiteMap(
  articles: (NonNullable<SitemapByYearQuery['search']['nodes'][0]['entity']> & {
    __typename: 'Document'
  })[],
) {
  const sitemapData = {
    _name: 'urlset',
    _attrs: {
      xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
      'xmlns:news': 'http://www.google.com/schemas/sitemap-news/0.9',
    },
    _content: articles.map(({ meta }) => ({
      _name: 'url',
      _content: [
        { _name: 'loc', _content: `${BASE_URL}${meta.path}` },
        { 
          _name: 'lastmod', 
          _content: new Date(
            meta.lastPublishedAt || meta.publishDate!,
          ).toISOString() 
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
            { _name: 'news:publication_date', _content: meta.publishDate },
            { _name: 'news:title', _content: meta.title },
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
