import { gql } from '@apollo/client'
import { initializeApollo } from '../../../lib/apollo'

const BASE_URL = process.env.PUBLIC_BASE_URL || 'https://www.republik.ch'
const API_URL = process.env.NEXT_PUBLIC_API_URL

function generateSiteMap(articles) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${articles
  .map(({ meta }) => {
    return `
  <url>
    <loc>${BASE_URL}${meta.path}</loc>
    <lastmod>${meta.lastPublishedAt || meta.publishDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.8</priority>
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

  const apolloClient = initializeApollo(null, {
    headers: req.headers,
  })

  const fromDate = new Date(parseInt(year), 0, 1) // January 1st of the year
  const toDate = new Date(parseInt(year) + 1, 0, 1) // January 1st of the next year

  try {
    const { data, errors } = await apolloClient.query({
      query: gql`
        query sitemapByYear($from: DateTime!, $to: DateTime!) {
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
                    publishDate
                    lastPublishedAt
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
      console.error(`[sitemap-${year}]`, errors)
      return res.status(500).json({ error: 'GraphQL error' })
    }

    const {
      search: { nodes },
    } = data

    const articles = nodes.map(({ entity }) => entity)

    const sitemap = generateSiteMap(articles)

    res.setHeader('Content-Type', 'text/xml')
    res.setHeader('Cache-Control', 'public, max-age=3600') // Cache for 1 hour
    
    res.write(sitemap)
    res.end()
  } catch (error) {
    console.error(`[sitemap-${year}]`, 'Failed to fetch articles:', error)
    return res.status(500).json({ error: 'Failed to generate sitemap' })
  }
} 