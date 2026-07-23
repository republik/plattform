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

const { Subscriptions } = require('@orbiting/backend-modules-subscriptions')

// Read-only counterpart to PublishNotificationWorker#notifyPublish: resolves
// the same recipient set (articleCollection subscribers ∪ contributor
// subscribers, deduped by user) but only counts them, for the studio
// subscriber-count endpoint (express/subscriberCount.ts) to show editors how
// many people a publish-with-notifications decision would reach.
export const getSubscriberCountForArticle = async (
  documentId: string,
  context: any,
): Promise<{ totalCount: number } | null> => {
  const article = await fetchArticleForNotification(documentId)
  if (!article) {
    return null
  }

  const articleCollectionIds = (article.articleCollections ?? [])
    .map((entry) => entry.collection?._id)
    .filter((id): id is string => Boolean(id))
  const authorUserIds = (article.contributors ?? [])
    .map((entry) => entry.contributor?.userId)
    .filter((id): id is string => Boolean(id))

  const [collectionSubs, authorSubs] = await Promise.all([
    Subscriptions.getSubscriptionsForUserAndObjects(
      null,
      { type: 'Document', ids: articleCollectionIds, filters: ['Document'] },
      context,
      { onlyEligibles: true },
    ),
    Subscriptions.getSubscriptionsForUserAndObjects(
      null,
      { type: 'User', ids: authorUserIds, filters: ['Document'] },
      context,
      { onlyEligibles: true },
    ),
  ])

  const [collectionUsers, authorUsers] = await Promise.all([
    Subscriptions.getUsersWithSubscriptions(collectionSubs, context),
    Subscriptions.getUsersWithSubscriptions(authorSubs, context),
  ])

  const uniqueUserIds = new Set<string>()
  for (const user of [...collectionUsers, ...authorUsers]) {
    uniqueUserIds.add(user.__subscription.userId)
  }

  return { totalCount: uniqueUserIds.size }
}
