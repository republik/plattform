import { AudioFeedQuery } from '@app/graphql/republik-api/gql/graphql'
import { Podcast } from 'podcast'

// Get the size of a file in bytes that is hosted on the server
export async function getFileSize(url: string) {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer).length
}

function sanitizeText(title: string) {
  // replace all special spaces with normal spaces
  // replace all special hyphens with normal hyphens
  return title.replaceAll(/\s/g, ' ').replaceAll(/‑/g, '-')
}

type AudioFeed = AudioFeedQuery['feed']

export async function getFeed(
  audioFeed: AudioFeed,
  req: Request,
): Promise<string> {
  const url = new URL(req.url)
  url.search = ''
  console.log(url.hostname)
  const cleanedUrl = url.toString()
  /* lets create an rss feed */
  const feed = new Podcast({
    title: 'Republik Audio Feed',
    description: 'TBD',
    feedUrl: cleanedUrl,
    siteUrl: process.env.PUBLIC_BASE_URL,
    imageUrl: url.hostname + '/static/marketing/audio.png',
    docs: cleanedUrl,
    author: 'Republik Magazin',
    managingEditor: 'Republik Magazin',
    webMaster: 'Repulik Magazin',
    copyright: `${new Date().getFullYear()} Republik AG`,
    language: 'de',
    categories: ['Category 1', 'Category 2', 'Category 3'],
    pubDate: new Date(),
    ttl: 60, // allow caching for 1 hour
    itunesAuthor: 'Republik Magazin',
    itunesSubtitle: 'TBD',
    itunesSummary: 'TBD',
    itunesOwner: { name: 'Republik Magazin', email: 'kontakt@republik.ch' },
    itunesExplicit: false,
    itunesCategory: [
      {
        text: 'News',
      },
    ],
    itunesImage: url.hostname + '/static/marketing/audio.png',
  })

  const items = await Promise.all(
    audioFeed.nodes
      .filter(
        (item) =>
          item.meta.audioSource?.kind === 'readAloud' &&
          item.meta.audioSource.mp3,
      )
      .map(async (item, i) => {
        try {
          console.log('Fetching', i)
          const size = await getFileSize(item.meta.audioSource.mp3)
          console.log('Done fetching', i)
          const audioCover = new URL(item.meta.audioCover)
          audioCover.search = ''

          return {
            title: sanitizeText(item.meta.title),
            description: sanitizeText(item.meta.description),
            url: url.hostname + item.meta.path,
            id: url.hostname + item.meta.path,
            enclosure: {
              url: item.meta.audioSource.mp3,
              size,
              type: 'audio/mpeg',
              file: item.meta.audioSource.mp3,
            },
            date: new Date(item.meta.publishDate),
            itunesAuthor: item.meta.contributors
              .filter((c) => c.kind === 'Voice')
              .map((c) => c.name)
              .join(', '),
            itunesDuration: item.meta.audioSource.durationMs / 1000,
            itunesExplicit: false,
            itunesImage: audioCover.toString(),
          }
        } catch (e) {
          console.error(e)
          return null
        }
      }),
  )
  console.log('Done')

  items.filter(Boolean).map((item) => {
    feed.addItem({
      ...item,
    })
  })

  // Output: JSON Feed 1.0
  return feed.buildXml()
}
