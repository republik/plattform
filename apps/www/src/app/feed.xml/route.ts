import { client } from '@/app/(sanity)/lib/client'
import { FEED_QUERY } from '@/app/(sanity)/groq/feed-query'
import { Feed } from 'feed'

export async function GET() {
  const feed = new Feed({
    id: process.env.NEXT_PUBLIC_BASE_URL,
    link: process.env.NEXT_PUBLIC_BASE_URL,
    title: 'Republik Magazin',
    language: 'de',
    generator: 'Republik-Feed',
    copyright: `© 2017-${new Date().getFullYear()} Republik AG`,
  })

  const articles = await client.fetch(FEED_QUERY)

  articles.forEach((article) => {
    if (!article.path || !article.publishDate) return

    const link = `${process.env.NEXT_PUBLIC_BASE_URL}${article.path}?utm_medium=rss`
    const description = article.description ?? ''

    feed.addItem({
      id: article._id,
      title: article.title ?? '',
      link,
      description: description || undefined,
      date: new Date(article.publishDate),
      content: `<p>${description}</p><p><a href="${link}">Beitrag öffnen</a></p>`,
    })
  })

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
