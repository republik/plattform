const {
  Document: { getSubscriptionsForDoc },
  Subscriptions: { getUsersWithSubscriptions },
  sendNotification,
} = require('@orbiting/backend-modules-subscriptions')

const Promise = require('bluebird')

const { DEFAULT_MAIL_FROM_ADDRESS, DEFAULT_MAIL_FROM_NAME, FRONTEND_BASE_URL } =
  process.env

const groupSubscribersByObjectId = (subscribers, key) =>
  subscribers.reduce((agg, user) => {
    const objectId = user.__subscription[key]
    if (agg[objectId]) {
      agg[objectId].push(user)
    } else {
      agg[objectId] = [user]
    }
    return agg
  }, {})

const notifyPublish = async (
  repoId,
  filters,
  context,
  testUser,
  simulateAllPossibleSubscriptions,
) => {
  const { loaders, t } = context

  if (testUser && !testUser.id) {
    throw new Error(t('api/unexpected'))
  }

  const doc = await loaders.Document.byRepoId.load(repoId)
  const docRepoId = doc.meta.repoId

  const eventInfo = {
    objectType: 'Document',
    objectId: docRepoId,
  }
  const appContent = {
    body:
      doc.meta.shortTitle || [doc.meta.title, doc.meta.description].join(' - '),
    url: `${FRONTEND_BASE_URL}${doc.meta.path}`,
    // change when APP allows to open url of other types
    // https://github.com/orbiting/app/blob/master/src/services/pushNotificationsProvider.ios.js#L59
    type: 'discussion',
    tag: docRepoId,
  }

  const docsSubscriptions = []
  const readAloudSubscriptions = []
  const authorsSubscriptions = []

  await getSubscriptionsForDoc(
    doc,
    testUser?.id, // otherwise null => for all users
    {
      ...(testUser && simulateAllPossibleSubscriptions
        ? {
            onlyEligibles: false,
            includeParents: true,
            uniqueUsers: false,
            includeNotActive: true,
            simulate: true,
          }
        : {
            filters,
            onlyEligibles: true,
            includeParents: true,
            uniqueUsers: true,
          }),
    },
    context,
  ).then((subs) => {
    subs.forEach((sub) => {
      if (
        (!filters || filters.includes('Document')) &&
        sub.objectType === 'Document' &&
        (!sub.filters || sub.filters.includes('Document'))
      ) {
        docsSubscriptions.push(sub)
      } else if (
        filters.includes('ReadAloud') &&
        sub.objectType === 'Document' &&
        (!sub.filters || sub.filters.includes('ReadAloud'))
      ) {
        readAloudSubscriptions.push(sub)
      } else if (
        sub.objectType === 'User' &&
        (!sub.filters || sub.filters.includes('Document'))
      ) {
        authorsSubscriptions.push(sub)
      } else {
        console.warn('discarded subscription', sub.id)
      }
    })
  })

  let event

  const docsSubscribers = await getUsersWithSubscriptions(
    docsSubscriptions,
    context,
  )
  const docSubscribersByDocId = groupSubscribersByObjectId(
    docsSubscribers,
    'objectDocumentId',
  )

  await Promise.each(Object.keys(docSubscribersByDocId), async (docId) => {
    // docId === repoId of the format. This is the format!
    const format = await loaders.Document.byRepoId.load(docId)

    // Do not send notifications for newsletter formats
    const skipEmailForNewsletterFormat = !!format.meta.newsletter

    const title =
      format.meta.notificationTitle ||
      t('api/notifications/doc/title', {
        formatTitle: `«${format.meta.title}»`,
        articleTitle: `«${doc.meta.title}»`,
      })

    const subscribers = docSubscribersByDocId[docId]

    const formatUrl = new URL(format.meta.path, FRONTEND_BASE_URL)

    const formatColor = format.meta.color ?? '#282828'

    event = await sendNotification(
      {
        event: event ? { id: event.id } : eventInfo,
        users: subscribers,
        content: {
          app: {
            ...appContent,
            title,
          },
          mail: skipEmailForNewsletterFormat
            ? undefined
            : (u) => {
                return {
                  to: u.email,
                  subject: title,
                  fromEmail: DEFAULT_MAIL_FROM_ADDRESS,
                  fromName: DEFAULT_MAIL_FROM_NAME,
                  templateName: 'publish_article_notification',
                  globalMergeVars: [
                    {
                      name: 'TITLE',
                      content: doc.meta.title,
                    },
                    {
                      name: 'FORMAT_TITLE',
                      content: format.meta.title,
                    },
                    {
                      name: 'FORMAT_URL',
                      content: formatUrl.toString(),
                    },
                    {
                      name: 'FORMAT_COLOR',
                      content: formatColor,
                    },
                    {
                      name: 'DESCRIPTION',
                      content: doc.meta.description,
                    },
                    {
                      name: 'CREDITS',
                      content: doc.meta.creditsString,
                    },
                    {
                      name: 'URL',
                      content: appContent.url,
                    },
                  ],
                }
              },
        },
      },
      context,
    )
  })

  const readAloudSubscribers = await getUsersWithSubscriptions(
    readAloudSubscriptions,
    context,
  )
  const readAloudSubscribersByDoc = groupSubscribersByObjectId(
    readAloudSubscribers,
    'objectDocumentId',
  )

  await Promise.each(Object.keys(readAloudSubscribersByDoc), async (docId) => {
    const subscribedDoc = await loaders.Document.byRepoId.load(docId)

    const title = t('api/notifications/doc/readAloud/title', {
      title: `«${subscribedDoc.meta.title}»`,
    })

    const subscribers = readAloudSubscribersByDoc[docId]

    event = await sendNotification(
      {
        event: event ? { id: event.id } : eventInfo,
        users: subscribers,
        content: {
          app: {
            ...appContent,
            title,
          },
        },
      },
      context,
    )
  })

  const authorsSubscribers = await getUsersWithSubscriptions(
    authorsSubscriptions,
    context,
  )
  const authorSubscribersByAuthorId = groupSubscribersByObjectId(
    authorsSubscribers,
    'objectUserId',
  )

  await Promise.each(
    Object.keys(authorSubscribersByAuthorId),
    async (authorId) => {
      const author = await loaders.User.byId.load(authorId)
      const subscribers = authorSubscribersByAuthorId[authorId]

      let portraitUrl
      if (URL.canParse(author._raw.portraitUrl)) {
        const u = new URL(author._raw.portraitUrl)
        u.searchParams.set('resize', '84x84')
        u.searchParams.set('bw', '1')
        u.searchParams.set('format', 'auto')
        portraitUrl = u.toString()
      }

      const profileUrl = new URL(`~${author.slug}`, FRONTEND_BASE_URL)

      event = await sendNotification(
        {
          event: event ? { id: event.id } : eventInfo,
          users: subscribers,
          content: {
            app: {
              ...appContent,
              title: t('api/notifications/doc/author/title', {
                name: author.name,
              }),
            },
            mail: (u) => {
              return {
                to: u.email,
                subject: t('api/notifications/doc/author/title', {
                  name: author.name,
                }),
                fromEmail: DEFAULT_MAIL_FROM_ADDRESS,
                fromName: DEFAULT_MAIL_FROM_NAME,
                templateName: 'publish_author_notification',
                globalMergeVars: [
                  {
                    name: 'AUTHOR_NAME',
                    content: author.name,
                  },
                  {
                    name: 'AUTHOR_PROFILE_URL',
                    content: profileUrl.toString(),
                  },
                  {
                    name: 'AUTHOR_PORTRAIT_URL',
                    content: portraitUrl,
                  },
                  {
                    name: 'TITLE',
                    content: doc.meta.title,
                  },
                  {
                    name: 'DESCRIPTION',
                    content: doc.meta.description,
                  },
                  {
                    name: 'CREDITS',
                    content: doc.meta.creditsString,
                  },
                  {
                    name: 'URL',
                    content: appContent.url,
                  },
                ],
              }
            },
          },
        },
        context,
      )
    },
  )
}

module.exports = {
  notifyPublish,
}
