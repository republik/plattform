const {
  Instance,
  createUsers
} = require('@orbiting/backend-modules-test')

describe('subscriptions', () => {
  beforeAll(async () => {
    await Instance.init({
      serverName: 'republik',
      searchNotifyListener: false
    })
  }, 60000)

  afterAll(async () => {
    await global.instance.closeAndCleanup()
  }, 60000)

  beforeEach(async () => {
    const { pgdb } = global.instance.context
    await Promise.all([
      pgdb.public.subscriptions.truncate({ cascade: true }),
      pgdb.public.users.truncate({ cascade: true }),
      pgdb.public.events.truncate({ cascade: true }),
      pgdb.public.subscriptions.truncate({ cascade: true }),
      pgdb.public.notifications.truncate({ cascade: true })
    ])
    const users = createUsers(10, ['member'])
    await pgdb.public.users.insert(users)
    global.testUser = null
  })

  test('setup', async () => {
    const { pgdb } = global.instance.context
    expect(await pgdb.public.users.count()).toEqual(10)
  })

  test('DB schema', async () => {
    const { pgdb } = global.instance.context
    const [user0, user1] = createUsers(2, ['member'])
    const discussion = await pgdb.public.discussions.insertAndGet({ title: 'test' })

    await expect(
      pgdb.public.subscriptions.insert({
        userId: user0.id,
        objectType: 'User',
        objectUserId: null,
        objectDocumentId: user1.id,
        objectDiscussionId: null
      })
    ).rejects.toThrow(/wrong object arguments/)

    await expect(
      pgdb.public.subscriptions.insert({
        userId: user0.id,
        objectType: 'User',
        objectUserId: null,
        objectDocumentId: null,
        objectDiscussionId: discussion.id
      })
    ).rejects.toThrow(/wrong object arguments/)

    await expect(
      await pgdb.public.subscriptions.insertAndGet({
        userId: user0.id,
        objectType: 'User',
        objectUserId: user1.id,
        objectDocumentId: null,
        objectDiscussionId: null
      })
    ).toMatchObject({
      userId: user0.id,
      objectType: 'User'
    })

    await expect(
      pgdb.public.subscriptions.insert({
        userId: user0.id,
        objectType: 'User',
        objectUserId: user1.id,
        objectDocumentId: null,
        objectDiscussionId: null
      })
    ).rejects.toThrow(/duplicate key value/)
  }),

  test('lib', async () => {
    const {
      getSimulatedSubscriptionForUserAndObject,
      getSubscriptionsForUser,
      getSubscriptionsForUserAndObject,
      getSubscriptionsForUserAndObjects,
      upsertSubscription,
      unsubscribe
    } = require('../lib/Subscriptions')
    const { context } = global.instance
    const { pgdb } = context
    const [author, subscriber] = createUsers(2, ['member'])
    const subscriberContext = { ...context, user: subscriber }

    const subProps = {
      userId: subscriber.id,
      objectId: author.id,
      type: 'User'
    }
    const simulatedSubscription = getSimulatedSubscriptionForUserAndObject(
      subProps.userId,
      {
        type: subProps.type,
        id: subProps.objectId
      },
      subscriberContext
    )
    const subscription = await upsertSubscription(
      subProps,
      subscriberContext
    )
    expect(subscription).toBeTruthy()
    expect(subscription.active).toBeTruthy()
    expect(subscription.id).toBe(simulatedSubscription.id)
    expect(await pgdb.public.subscriptions.count()).toBe(1)

    const userSubscriptions = await getSubscriptionsForUser(
      subProps.userId,
      subscriberContext
    )
    expect(userSubscriptions.length).toBe(1)
    expect(userSubscriptions[0].id).toBe(subscription.id)

    expect(
      await getSubscriptionsForUserAndObject(
        subProps.userId,
        {
          type: subProps.type,
          id: subProps.objectId
        },
        subscriberContext
      ).then( subs => subs?.pop()?.id )
    ).toBe(subscription.id)

    expect(
      await getSubscriptionsForUserAndObjects(
        subProps.userId,
        {
          type: subProps.type,
          ids: [subProps.objectId]
        },
        subscriberContext
      ).then( subs => subs?.pop()?.id )
    ).toBe(subscription.id)

    await unsubscribe(subscription.id, context)
    expect(await pgdb.public.subscriptions.count()).toBe(1)
    expect(await pgdb.public.subscriptions.findOne({
      id: subscription.id,
      active: false
    })).toBeTruthy()

    expect(await getSubscriptionsForUser(
      subProps.userId,
      subscriberContext
    ).then( a => a.length)).toBe(0)

    expect(await getSubscriptionsForUser(
      subProps.userId,
      subscriberContext,
      { includeNotActive: true }
    ).then( a => a.length)).toBe(1)
  }),

  test('comments with filters', async () => {
    const {
      upsertSubscription,
      getUnreadNotificationsForUserAndObject
    } = require('../lib/Subscriptions')
    const createDiscussion = require('@orbiting/backend-modules-discussions/graphql/resolvers/_mutations/createDiscussion')
    const submitComment = require('@orbiting/backend-modules-discussions/graphql/resolvers/_mutations/submitComment')

    const { context } = global.instance
    const { pgdb } = context
    const [editor] = createUsers(2, ['editor'])
    const [author, subscriber] = createUsers(2, ['member', 'debater'])

    const filters = [null, 'Comment', 'Document']

    const discussionId = await createDiscussion(
      null,
      {
        title: 'test',
        anonymity: 'ALLOWED'
      },
      { ...context, user: editor }
    )

    for(let filter of filters) {
      await Promise.all([
        pgdb.public.subscriptions.truncate({ cascade: true }),
        pgdb.public.events.truncate({ cascade: true }),
        pgdb.public.subscriptions.truncate({ cascade: true }),
        pgdb.public.notifications.truncate({ cascade: true })
      ])

      const subscription = await upsertSubscription(
        {
          userId: subscriber.id,
          objectId: author.id,
          type: 'User',
          ...filter ? { filters: [filter] } : {}
        },
        { ...context, user: subscriber }
      )
      expect(subscription).toBeTruthy()

      const comment = await submitComment(
        null,
        {
          discussionId,
          content: `test filter:${filter}`
        },
        { ...context, user: author }
      )

      const events = await pgdb.public.events.find({
        objectType: 'Comment',
        objectId: comment.id
      })
      expect(events.length).toEqual(filter === 'Document' ? 0 : 1)

      const notifications = await pgdb.public.notifications.find({
        userId: subscriber.id,
        subscriptionId: subscription.id
      })
      expect(notifications.length).toEqual(filter === 'Document' ? 0 : 1)
      expect(notifications[0]?.readAt).toBeFalsy()

      expect(await getUnreadNotificationsForUserAndObject(
        subscriber.id,
        {
          type: 'Comment',
          id: comment.id
        },
        context
      ).then( a => a?.length)).toBe(filter === 'Document' ? 0 : 1)
    }
  })
})
