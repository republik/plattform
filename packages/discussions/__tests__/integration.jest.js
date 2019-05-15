const {
  Instance,
  createUsers
} = require('@orbiting/backend-modules-test')
const discussion1 = require('./seeds/discussion1')
const commentsTopLevel = require('./seeds/commentsTopLevel')
const {
  level1: level1Query,
  upvoteComment,
  downvoteComment,
  unvoteComment
} = require('./queries')

const getIdsString = arr => arr
  .map(c => c.id)
  .join('')

describe('discussions', () => {
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
      pgdb.public.discussions.truncate({ cascade: true }),
      pgdb.public.users.truncate({ cascade: true })
    ])
    const users = createUsers(10, ['member'])
    await pgdb.public.users.insert(users)
    await pgdb.public.discussions.insert(discussion1)
    await pgdb.public.comments.insert(commentsTopLevel)
    global.testUser = null
  })

  test('setup', async () => {
    const { pgdb } = global.instance.context
    expect(await pgdb.public.users.count()).toEqual(10)
    expect(await pgdb.public.discussions.count()).toEqual(1)
    expect(await pgdb.public.comments.count()).toEqual(6)
  })

  test('vote', async () => {
    const [user0, user1] = createUsers(2, ['member'])
    global.testUser = user0

    const commentId = commentsTopLevel[0].id

    expect(await global.instance.apolloFetch({
      query: upvoteComment,
      variables: { commentId }
    })).toEqual(
      { data: { upvoteComment: {
        upVotes: 1,
        downVotes: 0,
        userVote: 'UP'
      } } }
    )

    expect(await global.instance.apolloFetch({
      query: downvoteComment,
      variables: { commentId }
    })).toEqual(
      { data: { downvoteComment: {
        upVotes: 0,
        downVotes: 1,
        userVote: 'DOWN'
      } } }
    )

    expect(await global.instance.apolloFetch({
      query: unvoteComment,
      variables: { commentId }
    })).toEqual(
      { data: { unvoteComment: {
        upVotes: 0,
        downVotes: 0,
        userVote: null
      } } }
    )

    expect(await global.instance.apolloFetch({
      query: upvoteComment,
      variables: { commentId }
    })).toEqual(
      { data: { upvoteComment: {
        upVotes: 1,
        downVotes: 0,
        userVote: 'UP'
      } } }
    )

    expect(await global.instance.apolloFetch({
      query: unvoteComment,
      variables: { commentId }
    })).toEqual(
      { data: { unvoteComment: {
        upVotes: 0,
        downVotes: 0,
        userVote: null
      } } }
    )

    expect(await global.instance.apolloFetch({
      query: upvoteComment,
      variables: { commentId }
    })).toEqual(
      { data: { upvoteComment: {
        upVotes: 1,
        downVotes: 0,
        userVote: 'UP'
      } } }
    )

    global.testUser = user1

    expect(await global.instance.apolloFetch({
      query: upvoteComment,
      variables: { commentId }
    })).toEqual(
      { data: { upvoteComment: {
        upVotes: 2,
        downVotes: 0,
        userVote: 'UP'
      } } }
    )

    expect(await global.instance.apolloFetch({
      query: unvoteComment,
      variables: { commentId }
    })).toEqual(
      { data: { unvoteComment: {
        upVotes: 1,
        downVotes: 0,
        userVote: null
      } } }
    )
  })

  const testDiscussion = async (apolloFetch, query, variables, comments) => {
    const result = await apolloFetch({
      query,
      variables
    })
    expect(result.errors).toBeUndefined()

    const { discussion } = result.data
    expect(discussion).toBeTruthy()

    expect(discussion.comments.totalCount).toBe(commentsTopLevel.length)

    const slicedComments = comments.slice(0, variables.first)
    expect(
      getIdsString(discussion.comments.nodes)
    ).toBe(
      getIdsString(slicedComments)
    )

    if (comments.length > slicedComments.length) { // paginated
      expect(discussion.comments.pageInfo.hasNextPage).toBe(true)
      expect(discussion.comments.pageInfo.endCursor).toBeTruthy()
      await testDiscussion(
        apolloFetch,
        query,
        {
          ...variables,
          first: 100, // get all remaining
          after: discussion.comments.pageInfo.endCursor
        },
        comments.slice(variables.first, comments.length)
      )
    } else {
      expect(discussion.comments.pageInfo.hasNextPage).toBe(false)
      expect(discussion.comments.pageInfo.endCursor).toBeFalsy()
    }
  }

  test('discussion: top level comments ASC (no pagination)', async () => {
    await testDiscussion(
      global.instance.apolloFetch,
      level1Query,
      {
        discussionId: 'd0000000-0000-0000-0000-000000000001',
        first: 100,
        orderBy: 'DATE',
        orderDirection: 'ASC'
      },
      commentsTopLevel
    )
  })

  test('discussion: top level comments DESC (no pagination)', async () => {
    await testDiscussion(
      global.instance.apolloFetch,
      level1Query,
      {
        discussionId: 'd0000000-0000-0000-0000-000000000001',
        first: 100,
        orderBy: 'DATE',
        orderDirection: 'DESC'
      },
      commentsTopLevel.slice().reverse()
    )
  })

  test('discussion: top level comments DESC paginated', async () => {
    await testDiscussion(
      global.instance.apolloFetch,
      level1Query,
      {
        discussionId: 'd0000000-0000-0000-0000-000000000001',
        first: 3,
        orderBy: 'DATE',
        orderDirection: 'DESC'
      },
      commentsTopLevel.slice().reverse()
    )
  })
})
