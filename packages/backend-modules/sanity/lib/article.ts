import { createSanityClient } from './client'
import type { PortableTextBlocks } from './audio'

const sanityClient = createSanityClient()

export interface ArticleForNotification {
  _id: string
  title?: PortableTextBlocks
  notificationTitle?: PortableTextBlocks
  description?: PortableTextBlocks
  slug?: { current: string }
  articleCollections?: { collection: { _id: string } | null }[]
  contributors?: { contributor: { userId: string } | null }[]
}

export const fetchArticleForNotification = (documentId: string) =>
  sanityClient.fetch<ArticleForNotification | null>(
    `*[_id == $id][0]{
      _id, title, notificationTitle, description, slug,
      articleCollections[]{ "collection": collection->{ _id } },
      contributors[]{ "contributor": contributor->{ userId } }
    }`,
    { id: documentId },
    { perspective: 'raw' },
  )
