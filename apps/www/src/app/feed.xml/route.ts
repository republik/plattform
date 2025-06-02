import { RssFeedDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { getClient } from '@app/lib/apollo/client'
import { Feed } from 'feed'
import crypto from 'node:crypto'

export async function GET() {
  const feed = new Feed({
    id: process.env.NEXT_PUBLIC_BASE_URL,
    link: process.env.NEXT_PUBLIC_BASE_URL,
    title: 'Republik Magazin',
    language: 'de',
    generator: 'Republik-Feed',
    copyright: `© 2017-${new Date().getFullYear()} Republik AG`,
  })

  const gql = getClient()

  const { data } = await gql.query({ query: RssFeedDocument })

  if (data) {
    data.feed.nodes.forEach((n) => {
      if (n.entity.__typename === 'Document') {
        feed.addItem({
          id: crypto.createHash('sha256').update(n.entity.repoId).digest('hex'),
          title: n.entity.meta.title,
          link: `${process.env.NEXT_PUBLIC_BASE_URL}${n.entity.meta.path}?utm_medium=rss`,
          description: n.entity.meta.description,
          date: new Date(n.entity.meta.publishDate),
          content: `<p>${n.entity.meta.description}</p><p><a href="${process.env.NEXT_PUBLIC_BASE_URL}${n.entity.meta.path}?utm_medium=rss">Beitrag öffnen</a></p>`,
        })
      }
    })
  }

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
