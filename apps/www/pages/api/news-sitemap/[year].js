import { gql } from '@apollo/client'
import { initializeApollo } from '../../../lib/apollo'
import { parseJSONObject } from '../../../lib/safeJSON'

const BASE_URL = process.env.PUBLIC_BASE_URL || 'https://www.republik.ch'
const API_URL = process.env.NEXT_PUBLIC_API_URL
const SCHEMA_PUBLISHER = process.env.NEXT_PUBLIC_SCHEMA_PUBLISHER

const publisher = parseJSONObject(SCHEMA_PUBLISHER)

function generateNewsSiteMap(articles) {
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

export default async function handler(req, res) {
  const { year } = req.query
  
  if (!year || isNaN(parseInt(year))) {
    return res.status(400).json({ error: 'Invalid year parameter' })
  }

  if (!publisher.name || !publisher.knowsLanguage) {
    console.warn(
      '[news-sitemap]',
      'SCHEMA_PUBLISHER incomplete',
      `publisher.name=${publisher.name}`,
      `publisher.knowsLanguage=${publisher.knowsLanguage}`,
    )
    return res.status(500).json({ error: 'Publisher configuration incomplete' })
  }

  const apolloClient = initializeApollo(null, {
    headers: req.headers,
  })

  const fromDate = new Date(parseInt(year), 0, 1) // January 1st of the year
  const toDate = new Date(parseInt(year) + 1, 0, 1) // January 1st of the next year

  try {
    const { data, errors } = await apolloClient.query({
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
      console.error(`[news-sitemap-${year}]`, errors)
      return res.status(500).json({ error: 'GraphQL error' })
    }

    const {
      search: { nodes },
    } = data

    const articles = nodes.map(({ entity }) => entity)

    const sitemap = generateNewsSiteMap(articles)

    res.setHeader('Content-Type', 'application/xml')
    res.setHeader('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
    
    res.write(sitemap)
    res.end()
  } catch (error) {
    console.error(`[news-sitemap-${year}]`, 'Failed to fetch articles:', error)
    return res.status(500).json({ error: 'Failed to generate sitemap' })
  }
} 