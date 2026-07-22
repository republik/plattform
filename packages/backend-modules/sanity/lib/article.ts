import { createSanityClient } from './client'
import type { PortableTextBlocks } from './audio'

const sanityClient = createSanityClient()

export interface ArticleForNotification {
  _id: string
  title?: PortableTextBlocks
  notificationTitle?: PortableTextBlocks
  description?: PortableTextBlocks
  byline?: PortableTextBlocks
  slug?: { current: string }
  // "format" — the article's `heading` reference (a `page`, labelled
  // "Spitzmarke" elsewhere in studio, e.g.
  // workspaces/newsroom/tools/wochenvorschau/helpers/articleQuery.ts).
  // This is the branding/title/URL source for notifications, analogous to
  // publikator's Format document — NOT the same as articleCollections,
  // which govern who gets notified, not what the notification is branded as.
  format?: { title?: string; path?: string } | null
  articleCollections?: {
    collection: { _id: string; title?: string } | null
  }[]
  contributors?: { contributor: { userId: string } | null }[]
}

export const fetchArticleForNotification = (documentId: string) =>
  sanityClient.fetch<ArticleForNotification | null>(
    `*[_id == $id][0]{
      _id, title, notificationTitle, description, byline, slug,
      "format": heading->{ "title": pt::text(title), "path": slug.current },
      articleCollections[]{ "collection": collection->{ _id, title } },
      contributors[]{ "contributor": contributor->{ userId } }
    }`,
    { id: documentId },
    { perspective: 'raw' },
  )
