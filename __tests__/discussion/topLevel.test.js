require('dotenv').config({path: '.test.env'})
const test = require('tape-async')
const {
  apolloFetch,
  connectIfNeeded,
  pgDatabase
} = require('../helpers.js')
const discussion1 = require('./seeds/discussion1')
const commentsTopLevel = require('./seeds/commentsTopLevel')
const getUsers = require('./seeds/getUsers')
const { level1 } = require('./queries')

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

test('top level comments ASC (no pagination)', async (t) => {
  await prepare()
  const result = await apolloFetch({
    query: level1,
    variables: {
      discussionId: 'd0000000-0000-0000-0000-000000000001',
      first: 100,
      orderBy: 'DATE',
      orderDirection: 'ASC'
    }
  })
  t.notOk(result.errors, 'graphql query successful')
  const { discussion } = result.data
  t.ok(discussion, 'discussion present')
  t.equals(
    discussion.comments.totalCount,
    commentsTopLevel.length,
    'all comments present'
  )
  t.equals(
    getIdsString(discussion.comments.nodes),
    getIdsString(commentsTopLevel),
    'comments in correct order'
  )
  t.end()
})

test('top level comments DESC (no pagination)', async (t) => {
  await prepare()
  const result = await apolloFetch({
    query: level1,
    variables: {
      discussionId: 'd0000000-0000-0000-0000-000000000001',
      first: 100,
      orderBy: 'DATE',
      orderDirection: 'DESC'
    }
  })
  t.notOk(result.errors, 'graphql query successful')
  const { discussion } = result.data
  t.ok(discussion, 'discussion present')
  t.equals(
    discussion.comments.totalCount,
    commentsTopLevel.length,
    'all comments present'
  )
  t.equals(
    getIdsString(discussion.comments.nodes),
    getIdsString(commentsTopLevel.reverse()),
    'comments in correct order'
  )
  t.end()
})
