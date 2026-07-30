import { sanityClient } from './client'
import type { PortableTextBlocks } from './audio'

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
  sanityClient().fetch<ArticleForNotification | null>(
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

// Who a publish notification for this article reaches: subscribers of its
// articleCollections (topics/series — see that field's own description,
// "Abonnenten dieser Sammlungen erhalten eine Benachrichtigung") plus
// subscribers of its contributors (authors).
//
// The single definition of that rule. PublishNotificationWorker sends to these
// lists and express/subscriberCount.ts counts them, and the count is only
// worth showing an editor as long as it is the same resolution the send does —
// two implementations would drift the first time the rule changes, silently.
export const resolveNotificationRecipients = async (
  article: ArticleForNotification,
  context: any,
): Promise<{ collectionSubscribers: any[]; authorSubscribers: any[] }> => {
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

  const [collectionSubscribers, authorSubscribers] = await Promise.all([
    Subscriptions.getUsersWithSubscriptions(collectionSubs, context),
    Subscriptions.getUsersWithSubscriptions(authorSubs, context),
  ])

  return { collectionSubscribers, authorSubscribers }
}

// Read-only counterpart to PublishNotificationWorker#notifyPublish: the same
// recipient set, deduped by user and only counted, for the studio
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

  const { collectionSubscribers, authorSubscribers } =
    await resolveNotificationRecipients(article, context)

  const uniqueUserIds = new Set<string>()
  for (const user of [...collectionSubscribers, ...authorSubscribers]) {
    uniqueUserIds.add(user.__subscription.userId)
  }

  return { totalCount: uniqueUserIds.size }
}
