import { BaseWorker, Job } from '@orbiting/backend-modules-job-queue'
import { GraphqlContext } from '@orbiting/backend-modules-types'
import { SendOptions } from 'pg-boss'
import {
  fetchArticleForNotification,
  resolveNotificationRecipients,
} from '../article'
import { plainText } from '../../tts'

const { sendNotification } = require('@orbiting/backend-modules-subscriptions')

export interface PublishNotificationPayload {
  $version: 'v1'
  documentId: string
}

const DEFAULT_FORMAT_COLOR = '#282828'

// Groups subscriber rows by the object id they subscribed to — one entry per
// articleCollection or per author — mirroring publikator/lib/Notifications.js's
// groupSubscribersByObjectId, ported verbatim (plain .reduce, no bluebird).
const groupSubscribersByObjectId = (subscribers: any[], key: string) =>
  subscribers.reduce((agg: Record<string, any[]>, user: any) => {
    const objectId = user.__subscription[key]
    if (agg[objectId]) {
      agg[objectId].push(user)
    } else {
      agg[objectId] = [user]
    }
    return agg
  }, {})

// Background counterpart to publikator/lib/Notifications.js#notifyPublish,
// for Sanity-authored articles. Recipients are the union of subscribers of
// the article's articleCollections (topics/series — see that field's own
// description: "Abonnenten dieser Sammlungen erhalten eine Benachrichtigung")
// and subscribers of its contributors (authors). Registered as a queue
// worker (not called inline from the webhook) for the same reason
// publikator's finalizePublication enqueues rather than calling
// notifyPublish directly: sending pushes/emails to potentially many
// subscribers shouldn't block a web request.
export class PublishNotificationWorker extends BaseWorker<PublishNotificationPayload> {
  readonly queue = 'sanity:publish-notification'
  readonly options: SendOptions = { retryLimit: 0 }

  async perform(jobs: Job<PublishNotificationPayload>[]) {
    for (const job of jobs) {
      if (job.data.$version !== 'v1') {
        throw Error('unable to perform this job version. Expected v1')
      }
      await this.notifyPublish(job.data.documentId)
    }
  }

  private async notifyPublish(documentId: string) {
    // BaseWorker types `context` as ConnectionContext, but workers only ever
    // *perform* in the scheduler process, and that is where the queue is
    // registered with a full GraphqlContext (apps/api/server.js calls
    // queue.startWorkers() only on the scheduler path) -- so loaders/t are
    // present at run time.
    const context = this.context as GraphqlContext
    const { loaders, t } = context

    const article = await fetchArticleForNotification(documentId)
    if (!article) {
      this.logger.error({ documentId }, 'article not found')
      return
    }

    const { collectionSubscribers, authorSubscribers } =
      await resolveNotificationRecipients(article, context)

    const eventInfo = { objectType: 'Document', objectId: article._id }
    const articleTitle = plainText(article.title)
    const articleUrl = article.slug?.current
      ? `${process.env.FRONTEND_BASE_URL}${article.slug.current}`
      : process.env.FRONTEND_BASE_URL
    const appContent = {
      url: articleUrl,
      type: 'article',
      tag: article._id,
    }
    // The article's `heading` reference (a `page`, labelled "Spitzmarke"
    // elsewhere in studio) — the branding/title/URL source for
    // notifications, analogous to publikator's Format document. Constant
    // for this article, unlike publikator's per-group re-derivation from a
    // different repo each time (a Sanity article has exactly one `heading`).
    const format = article.format

    let event: any

    // One sendNotification call per articleCollection group, so followers
    // of different collections each see a notification branded with the
    // collection they actually follow — mirrors publikator's per-format loop.
    const subscribersByCollectionId = groupSubscribersByObjectId(
      collectionSubscribers,
      'objectDocumentId',
    )
    for (const collectionId of Object.keys(subscribersByCollectionId)) {
      const subscribers = subscribersByCollectionId[collectionId]

      const title =
        plainText(article.notificationTitle) ||
        (format?.title
          ? t('api/notifications/doc/title', {
              formatTitle: `«${format.title}»`,
              articleTitle: `«${articleTitle}»`,
            })
          : articleTitle)

      const formatUrl = format?.path
        ? `${process.env.FRONTEND_BASE_URL}${format.path}`
        : articleUrl

      event = await sendNotification(
        {
          event: event ? { id: event.id } : eventInfo,
          users: subscribers,
          content: {
            app: { ...appContent, title },
            mail: (u: any) => ({
              to: u.email,
              subject: title,
              fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
              fromName: process.env.DEFAULT_MAIL_FROM_NAME,
              templateName: 'publish_article_notification',
              globalMergeVars: [
                { name: 'TITLE', content: articleTitle },
                { name: 'FORMAT_TITLE', content: format?.title },
                { name: 'FORMAT_URL', content: formatUrl },
                { name: 'FORMAT_COLOR', content: DEFAULT_FORMAT_COLOR },
                {
                  name: 'DESCRIPTION',
                  content: plainText(article.description),
                },
                { name: 'CREDITS', content: plainText(article.byline) },
                { name: 'URL', content: articleUrl },
              ],
            }),
          },
        },
        context,
      )
    }

    // One sendNotification call per author group — ported verbatim from
    // publikator/lib/Notifications.js (same Postgres User loader; a
    // contributor's `userId` field already is the Postgres user id).
    const subscribersByAuthorId = groupSubscribersByObjectId(
      authorSubscribers,
      'objectUserId',
    )
    for (const authorId of Object.keys(subscribersByAuthorId)) {
      const author = await loaders.User.byId.load(authorId)
      const subscribers = subscribersByAuthorId[authorId]

      let portraitUrl: string | undefined
      if (URL.canParse(author._raw.portraitUrl)) {
        const u = new URL(author._raw.portraitUrl)
        u.searchParams.set('resize', '84x84')
        u.searchParams.set('bw', '1')
        u.searchParams.set('format', 'auto')
        portraitUrl = u.toString()
      }
      const profileUrl = new URL(
        `~${author.slug}`,
        process.env.FRONTEND_BASE_URL,
      )

      const title = t('api/notifications/doc/author/title', {
        name: author.name,
      })

      event = await sendNotification(
        {
          event: event ? { id: event.id } : eventInfo,
          users: subscribers,
          content: {
            app: { ...appContent, title },
            mail: (u: any) => ({
              to: u.email,
              subject: title,
              fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
              fromName: process.env.DEFAULT_MAIL_FROM_NAME,
              templateName: 'publish_author_notification',
              globalMergeVars: [
                { name: 'AUTHOR_NAME', content: author.name },
                { name: 'AUTHOR_PROFILE_URL', content: profileUrl.toString() },
                { name: 'AUTHOR_PORTRAIT_URL', content: portraitUrl },
                { name: 'TITLE', content: articleTitle },
                {
                  name: 'DESCRIPTION',
                  content: plainText(article.description),
                },
                { name: 'CREDITS', content: plainText(article.byline) },
                { name: 'URL', content: articleUrl },
              ],
            }),
          },
        },
        context,
      )
    }
  }
}
