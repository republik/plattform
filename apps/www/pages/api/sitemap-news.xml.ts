import { toXML } from 'jstoxml'
import { NextApiRequest, NextApiResponse } from 'next'
import { createApolloFetch } from 'apollo-fetch'
import { timeHour } from 'd3-time'

import withReqMethodGuard from '../../lib/api/withReqMethodGuard'
import HTTPMethods from '../../lib/api/HTTPMethods'
import { PUBLIC_BASE_URL } from '../../lib/constants'

export default withReqMethodGuard(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const apolloFetch = createApolloFetch({
      uri: process.env.API_URL,
    })
    const { apiKey } = req.query

    const toDate = new Date()
    const fromDate = timeHour.offset(toDate, -48)

    const response = await apolloFetch({
      query: `
      query sitemap($apiKey: String, $from: DateTime!, $to: DateTime!) {
        search(
          filter: {
            type: Document
            template: "article"
            publishedAt: { from: $from to: $to }
          }
          first: 1000
          apiKey: $apiKey
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
        apiKey,
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      },
    })

    if (response.errors) {
      console.error('[sitemap news]', response.errors)
      return res.status(503).end()
    }
    const {
      search: { nodes, totalCount },
    } = response.data

    if (!nodes.length && totalCount > 0) {
      console.log('[sitemap news]', 'unauthorized request', `apiKey=${apiKey}`)
      return res.status(403).end()
    }

    res.setHeader('Content-Type', 'application/xml')
    return res.status(200).send(
      toXML(
        {
          _name: 'urlset',
          _attrs: {
            xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
            ['xmlns:news']: 'http://www.google.com/schemas/sitemap-news/0.9',
          },
          _content: nodes.map(({ entity: { meta } }) => ({
            url: {
              loc: `${PUBLIC_BASE_URL}${meta.path}`,
              ['news:news']: {
                ['news:publication']: {
                  ['news:name']: 'Republik',
                  ['news:language']: 'de',
                },
                ['news:publication_date']: meta.publishDate,
                ['news:title']:
                  meta.seoTitle || meta.twitterTitle || meta.title,
              },
            },
          })),
        },
        {
          header: true,
          indent: '  ',
        },
      ),
    )
  },
  [HTTPMethods.GET],
)
