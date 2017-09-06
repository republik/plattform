require('leaked-handles')
const test = require('tape')
if (process.env.NODE_ENV === 'test-local') {
  process.env = {
    ...process.env,
    PORT: 6000,
    PUBLIC_URL: 'http://localhost:6000',
    SESSION_SECRET: 'asdfasdf'
  }
}

const Server = require('../server')
const { createApolloFetch } = require('apollo-fetch')

const GRAPHQL_URL = `http://localhost:${process.env.PORT}/graphql`

const apolloFetch = createApolloFetch({
  uri: GRAPHQL_URL
})

test('setup', async (t) => {
  await Server.run()
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
  t.ok(result.data.__schema, 'result.data.__schema should be truthy')
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
  t.equals(result.errors[0].message, 'Sie müssen sich zuerst einloggen.')
  t.end()
})

test('teardown', async (t) => {
  Server.close()
  t.end()
  // before https://github.com/apollographql/subscriptions-transport-ws/pull/257
  // is fixed, no clean exit is possible
  process.exit(0)
})
