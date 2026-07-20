import { Request, Response } from 'express'
import { fetchArticleForNotification } from '../lib/article'
import { plainText } from '../tts'

const {
  Subscriptions,
  sendNotification,
} = require('@orbiting/backend-modules-subscriptions')

// Handles the request sent by the studio repo's functions/sync-notifications
// Blueprint Function: POST { documentId }. Recipients are the union of
// subscribers of the article's articleCollections (topics/series) and
// subscribers of its contributors (authors) — the same subscription
// mechanism publikator's Format-based notifications already use, just fed
// Sanity ids/userIds instead of repoIds.
export const publishNotificationHandler =
  (context: any) => async (req: Request, res: Response) => {
    const documentId = req.body?.documentId
    if (!documentId || typeof documentId !== 'string') {
      return res
        .status(400)
        .json({ success: false, error: 'missing documentId' })
    }

    const article = await fetchArticleForNotification(documentId)
    if (!article) {
      return res
        .status(404)
        .json({ success: false, error: `document ${documentId} not found` })
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
      ),
      Subscriptions.getSubscriptionsForUserAndObjects(
        null,
        { type: 'User', ids: authorUserIds, filters: ['Document'] },
        context,
      ),
    ])

    const subsByUserId = new Map()
    for (const sub of [...collectionSubs, ...authorSubs]) {
      subsByUserId.set(sub.userId, sub)
    }

    const users = await Subscriptions.getUsersWithSubscriptions(
      [...subsByUserId.values()],
      context,
    )

    if (users.length) {
      const url = article.slug?.current
        ? `${process.env.FRONTEND_BASE_URL}${article.slug.current}`
        : process.env.FRONTEND_BASE_URL

      await sendNotification(
        {
          event: { objectType: 'Document', objectId: article._id },
          users,
          content: {
            app: {
              title:
                plainText(article.notificationTitle) ||
                plainText(article.title),
              body: plainText(article.description),
              url,
              type: 'article',
              tag: article._id,
            },
          },
        },
        context,
      )
    }

    return res.json({ success: true })
  }
