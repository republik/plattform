const test = require('tape-async')
const {
  apolloFetch,
  connectIfNeeded,
  pgDatabase
} = require('../helpers.js')
const discussion1 = require('./seeds/discussion1')
const commentsTopLevel = require('./seeds/commentsTopLevel')
const getUsers = require('./seeds/getUsers')
const { level1: level1Query } = require('./queries')

const prepare = async () => {
  await connectIfNeeded()
  const pgdb = pgDatabase()
  await Promise.all([
    pgdb.public.discussions.truncate({ cascade: true }),
    pgdb.public.users.truncate({ cascade: true })
  ])
  const users = getUsers(10)
  await Promise.all([
    pgdb.public.users.insert(users),
    pgdb.public.discussions.insert(discussion1),
    pgdb.public.comments.insert(commentsTopLevel)
  ])
}

const getIdsString = arr => arr
  .map(c => c.id)
  .join('')

const testDiscussion = async (query, variables, comments, t) => {
  const result = await apolloFetch({
    query,
    variables
  })
  t.notOk(result.errors, 'graphql query successful')
  const { discussion } = result.data
  t.ok(discussion, 'discussion present')
  t.equals(
    discussion.comments.totalCount,
    commentsTopLevel.length,
    'totalCount is correct'
  )
  const slicedComments = comments
    .slice(0, variables.first)
  t.equals(
    getIdsString(discussion.comments.nodes),
    getIdsString(slicedComments),
    'the right comments in correct order'
  )
  if (comments.length > slicedComments.length) { // paginated
    t.ok(discussion.comments.pageInfo.hasNextPage, 'has next page')
    t.ok(discussion.comments.pageInfo.endCursor, 'has endCursor')
    await testDiscussion(
      query,
      {
        ...variables,
        first: 100, // get all remaining
        after: discussion.comments.pageInfo.endCursor
      },
      comments
        .slice(variables.first, comments.length),
      t
    )
  } else {
    t.notOk(discussion.comments.pageInfo.hasNextPage, 'no next page')
    t.notOk(discussion.comments.pageInfo.endCursor, 'no endCursor')
  }
  // const util = require('util')
  // console.log(util.inspect(discussion, {depth:null}))
  return discussion
}

test('discussion: top level comments ASC (no pagination)', async (t) => {
  await prepare()
  await testDiscussion(
    level1Query,
    {
      discussionId: 'd0000000-0000-0000-0000-000000000001',
      first: 100,
      orderBy: 'DATE',
      orderDirection: 'ASC'
    },
    commentsTopLevel,
    t
  )
  t.end()
})

test('discussion: top level comments DESC (no pagination)', async (t) => {
  await testDiscussion(
    level1Query,
    {
      discussionId: 'd0000000-0000-0000-0000-000000000001',
      first: 100,
      orderBy: 'DATE',
      orderDirection: 'DESC'
    },
    commentsTopLevel.slice().reverse(),
    t
  )
  t.end()
})

test('discussion: top level comments DESC paginated', async (t) => {
  await testDiscussion(
    level1Query,
    {
      discussionId: 'd0000000-0000-0000-0000-000000000001',
      first: 3,
      orderBy: 'DATE',
      orderDirection: 'DESC'
    },
    commentsTopLevel.slice().reverse(),
    t
  )
  t.end()
})
