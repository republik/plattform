const { Instance } = require('@orbiting/backend-modules-test')

const {
  Users
} = require('@orbiting/backend-modules-auth/__tests__/auth')
const {
  deleteRepos
} = require('./helpers')
const {
  commit,
  PUBLISH_MUTAION
} = require('./graphqlQueries.js')
const docs = require('./documents')
const {
  createUsers
} = require('@orbiting/backend-modules-test')

beforeAll(async () => {
  await Instance.init({
    serverName: 'publikator'
  })
  await deleteRepos()
  const { pgdb } = global.instance.context
  await pgdb.public.users.insert(Users.Editor)
  global.testUser = Users.Editor
}, 1000 * 60 * 2)

afterAll(async () => {
  await global.instance.closeAndCleanup()
  await deleteRepos()
}, 60000)

const getRepoId = (name) => {
  const { GITHUB_LOGIN } = process.env
  return `${GITHUB_LOGIN}/${name}`
}

describe('document subscriptions and notifications', () => {
  const user = Users.Editor
  let repos
  const originalDoc = docs.postschiff[0]
  const { authorUserId } = originalDoc

  beforeAll(() => {
    repos = {
      format: {
        repoId: getRepoId('article-format-test')
      },
      child: {
        repoId: getRepoId('article-child-test')
      }
    }
    for (const step of ['format', 'child']) {
      const doc = JSON.parse(JSON.stringify(
        originalDoc.preCommit
      ))
      if (step === 'format') {
        doc.content.meta.slug = 'format'
      } else {
        doc.content.meta.format = `https://github.com/${repos.format.repoId}`
        doc.content.meta.slug = 'child'
      }
      repos[step].doc = doc
    }
  })

  test('setup: publish format', async () => {
    const { apolloFetch } = global.instance

    for (const step of ['format', 'child']) {
      const commitResult = await commit({
        variables: {
          parentId: null,
          message: 'init',
          repoId: repos[step].repoId,
          document: repos[step].doc
        },
        user
      })
      const commitId = commitResult?.data?.commit?.id
      expect(commitId).toBeTruthy()

      repos[step].commitId = commitId
    }

    const publishFormatResult = await apolloFetch({
      query: PUBLISH_MUTAION,
      variables: {
        repoId: repos.format.repoId,
        commitId: repos.format.commitId,
        updateMailchimp: false,
        prepublication: false
      }
    })
    expect(publishFormatResult?.data).toBeTruthy()
  })

  describe('format and author notifications', () => {
    const [subscriber] = createUsers(1, ['member'])

    const publishFunc = ({ notifySubscribers }) => global.instance.apolloFetch({
      query: PUBLISH_MUTAION,
      variables: {
        repoId: repos.child.repoId,
        commitId: repos.child.commitId,
        updateMailchimp: false,
        prepublication: false,
        notifySubscribers
      }
    })

    let formatSubscription
    let authorSubscription

    beforeAll(async () => {
      const { pgdb } = global.instance.context
      await pgdb.public.users.insert(subscriber)
      // author
      await pgdb.public.users.insert({
        id: authorUserId,
        firstName: 'Patrick',
        lastName: 'Author',
        email: 'patrick.author@test.republik.ch'
      })
    })

    test('format', async () => {
      const { Subscriptions: { upsertSubscription } } =
        require('@orbiting/backend-modules-subscriptions')
      const { context } = global.instance
      const { pgdb } = context

      // subscribe to format
      formatSubscription = await upsertSubscription(
        {
          userId: subscriber.id,
          objectId: repos.format.repoId,
          type: 'Document'
        },
        { ...context, user: subscriber }
      )
      expect(formatSubscription).toBeTruthy()
      expect(formatSubscription.active).toBeTruthy()
      expect(await pgdb.public.subscriptions.count()).toBe(1)

      await testNotifications({
        publishFunc,
        subscriberId: subscriber.id,
        subscriptionId: formatSubscription.id,
        objectType: 'Document',
        objectId: repos.child.repoId,
        context
      })
    })

    test('format and author', async () => {
      const { Subscriptions: { upsertSubscription } } =
        require('@orbiting/backend-modules-subscriptions')
      const { context } = global.instance
      const { pgdb } = context

      // subscribe to author
      authorSubscription = await upsertSubscription(
        {
          userId: subscriber.id,
          objectId: authorUserId,
          type: 'User'
        },
        { ...context, user: subscriber }
      )
      expect(authorSubscription).toBeTruthy()
      expect(authorSubscription.active).toBeTruthy()
      expect(await pgdb.public.subscriptions.count()).toBe(2)

      // still expecting format notification
      await testNotifications({
        publishFunc,
        subscriberId: subscriber.id,
        subscriptionId: formatSubscription.id,
        objectType: 'Document',
        objectId: repos.child.repoId,
        context
      })
    })

    test('author', async () => {
      const { context } = global.instance
      const { pgdb } = context

      await pgdb.public.subscriptions.update(
        { id: formatSubscription.id },
        { active: false }
      )

      // author notification
      await testNotifications({
        publishFunc,
        subscriberId: subscriber.id,
        // expect notification to come from author subscription
        subscriptionId: authorSubscription.id,
        // the event always comes from the doc
        objectType: 'Document',
        objectId: repos.child.repoId,
        context
      })
    })

    test('unsubscribe', async () => {
      const { context } = global.instance
      const { pgdb } = context

      await pgdb.public.subscriptions.update(
        { id: authorSubscription.id },
        { active: false }
      )

      await testNotifications({
        publishFunc,
        subscriberId: subscriber.id,
        objectType: 'Document',
        objectId: repos.child.repoId,
        expectNothing: true,
        context
      })
    })
  }, 1000 * 60)
})

const testNotifications = async ({
  publishFunc,
  subscriberId,
  subscriptionId,
  objectType,
  objectId,
  expectNothing = false,
  context
}) => {
  const {
    Subscriptions: {
      getUnreadNotificationsForUserAndObject
    }
  } = require('@orbiting/backend-modules-subscriptions')
  const { pgdb } = context

  for (const notifySubscribers of [false, true]) {
    const expectedLength = notifySubscribers ? (expectNothing ? 0 : 1) : 0

    await Promise.all([
      pgdb.public.events.truncate({ cascade: true }),
      pgdb.public.notifications.truncate({ cascade: true })
    ])

    // publish child
    expect(
      await publishFunc({ notifySubscribers }).then(res => res.data)
    ).toBeTruthy()

    const events = await pgdb.public.events.find({
      objectType,
      objectId
    })
    expect(events.length).toEqual(expectedLength)

    const notifications = await pgdb.public.notifications.find({
      userId: subscriberId
    })
    expect(notifications.length).toEqual(expectedLength)
    if (expectedLength) {
      expect(notifications[0].subscriptionId).toEqual(subscriptionId)
    }

    expect(await getUnreadNotificationsForUserAndObject(
      subscriberId,
      {
        type: objectType,
        id: objectId
      },
      context
    ).then(a => a?.length)).toBe(expectedLength)
  }
}
