// uncomment to see open handles after tests run
// require('leaked-handles')

const test = require('tape-async')

// fake env vars
if (process.env.NODE_ENV === 'test-local') {
  process.env = {
    ...process.env,
    PORT: 6000,
    PUBLIC_URL: 'http://localhost:6000',
    SESSION_SECRET: 'asdfasdf',
    AUTO_LOGIN: true,
    GITHUB_LOGIN: 'orbiting'
  }
}
const Server = require('../server')
const Roles = require('../lib/Roles')
const tr = require('../lib/t')
const sleep = require('await-sleep')

const GRAPHQL_URI = `http://localhost:${process.env.PORT}/graphql`
const createApolloFetch = require('./createApolloFetchWithCookie')
const apolloFetch = createApolloFetch(GRAPHQL_URI)

let pgdb
const testEmail = 'tester@test.project-r.construction'

test('setup', async (t) => {
  const server = await Server.run()
  pgdb = server.pgdb

  const result = await apolloFetch({
    query: `
      {
        __schema {
          types {
            name
          }
        }
      }
    `
  })
  t.ok(result.data.__schema)
  t.end()
})

test('unauthorized', async (t) => {
  const result = await apolloFetch({
    query: `
      {
        repos(first: 20) {
          id
          commits(page: 0) {
            id
          }
        }
      }
    `
  })
  t.equals(result.data, null)
  t.equals(result.errors.length, 1)
  t.equals(result.errors[0].message, tr('api/signIn'))
  t.end()
})

test('signin', async (t) => {
  const result = await apolloFetch({
    query: `
      mutation {
        signIn(email: "${testEmail}") {
          phrase
        }
      }
    `
  })
  await sleep(4000)
  t.ok(result.data.signIn.phrase)
  t.ok(result.data.signIn.phrase.length)
  t.end()
})

test('repos (signed in, without role)', async (t) => {
  const result = await apolloFetch({
    query: `
      {
        repos(first: 2) {
          id
        }
      }
    `
  })
  t.equals(result.data, null)
  t.equals(result.errors.length, 1)
  t.equals(result.errors[0].message, tr('api/unauthorized', { role: 'editor' }))
  t.end()
})

test('add test user to role «editor»', async (t) => {
  const user = await pgdb.public.users.findOne({ email: testEmail })
  t.ok(user)
  const roledUser = await Roles.addUserToRole(user.id, 'editor', pgdb)
  t.ok(roledUser)
  t.deepLooseEqual(roledUser.roles, ['editor'])
  t.end()
})

test('repos', async (t) => {
  const result = await apolloFetch({
    query: `
      {
        repos(first: 2) {
          id
        }
      }
    `
  })
  t.ok(result.data)
  t.ok(result.data.repos)
  t.end()
})

test('teardown', async (t) => {
  Server.close()
  t.end()
  // before https://github.com/apollographql/subscriptions-transport-ws/pull/257
  // is fixed, no clean exit is possible
  process.exit(0)
})
