import { RssFeedDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { getClient } from '@app/lib/apollo/client'
import { Feed } from 'feed'

export async function GET() {
  const feed = new Feed({
    id: process.env.NEXT_PUBLIC_BASE_URL,
    link: process.env.NEXT_PUBLIC_BASE_URL,
    title: 'Republik Magazin',
    copyright: 'Republik AG',
  })

  const gql = getClient()

  const { data } = await gql.query({ query: RssFeedDocument })

  if (data) {
    data.feed.nodes.forEach((n) => {
      if (n.entity.__typename === 'Document') {
        feed.addItem({
          id: btoa(n.entity.repoId),
          title: n.entity.meta.title,
          link: `${process.env.NEXT_PUBLIC_BASE_URL}${n.entity.meta.path}`,
          description: n.entity.meta.description,
          author: n.entity.meta.contributors.map((a) => ({
            name: a.name,
          })),
          date: new Date(n.entity.meta.publishDate),
        })
      }
    })
  }

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  })
}
