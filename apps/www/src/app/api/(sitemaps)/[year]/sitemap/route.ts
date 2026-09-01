import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/app/(sanity)/lib/client'
import { SITEMAP_BY_YEAR_QUERY } from '@/app/(sanity)/groq/sitemap-query'

const BASE_URL = process.env.PUBLIC_BASE_URL

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ year: string }> },
) {
  const params = await props.params
  const year = parseInt(params.year)

  const fromDate = new Date(year, 0, 1) // January 1st of the year
  const toDate = new Date(year + 1, 0, 1) // January 1st of the next year

  try {
    const documents = await client.fetch(SITEMAP_BY_YEAR_QUERY, {
      from: fromDate.toISOString(),
      to: toDate.toISOString(),
    })

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${documents
      .filter((document) => document.path && document.publishDate)
      .map(
        (document) => `  <url>
        <loc>${BASE_URL}${document.path}</loc>
        <lastmod>${(() => {
          const updatedAt = new Date(document._updatedAt)
          const publishDate = new Date(document.publishDate!)
          // Return the more recent of the two dates
          return updatedAt > publishDate
            ? updatedAt.toISOString()
            : publishDate.toISOString()
        })()}</lastmod>
      </url>`,
      )
      .join('\n')}
    </urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
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
