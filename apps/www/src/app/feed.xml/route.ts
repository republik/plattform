import { Feed } from 'feed'

export async function GET() {
  const feed = new Feed({
    id: 'https://www.republik.ch',
    link: 'https://www.republik.ch',
    title: 'Republik RSS Feed',
    copyright: 'Republik AG',
  })

  const republikFeed = await fetch('https://api.republik.ch/graphql/', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query getFrontFeed {
          feed: search(
            filter: {
              feed: true
            }
            sort: { key: publishedAt, direction: DESC }
          ) {
            totalCount
            pageInfo {
              endCursor
              hasNextPage
            }
            nodes {
              entity {
                ... on Document {
                  id
                  meta {
                    credits
                    contributors {
                      name
                      kind
                      user {
                        id
                        username
                        slug
                        profileUrls
                      }
                    }
                    shortTitle
                    title
                    description
                    publishDate
                    prepublication
                    path
                    kind
                    template
                    color
                    format {
                      id
                      meta {
                        path
                        externalBaseUrl
                        title
                        color
                        kind
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
    }),
  })

  if (republikFeed.ok) {
    const articles = await republikFeed.json()

    articles.data.feed.nodes.forEach((n) => {
      const [base, repo] = atob(n.entity.id).split('/')

      feed.addItem({
        id: btoa(`${base}/${repo}`),
        title: n.entity.meta.title,
        link: `https://www.republik.ch${n.entity.meta.path}`,
        description: n.entity.meta.description,
        author: n.entity.meta.contributors.map((a) => ({
          name: a.name,
        })),
        date: new Date(n.entity.meta.publishDate),
      })
    })
  }

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
