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
      pgdb.public.users.truncate({ cascade: true })
    ])
    const users = createUsers(10, ['member'])
    await pgdb.public.users.insert(users)
    global.testUser = null
  })

  test('setup', async () => {
    const { pgdb } = global.instance.context
    expect(await pgdb.public.users.count()).toEqual(10)
  })

  test('DB', async () => {
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
  })
})
