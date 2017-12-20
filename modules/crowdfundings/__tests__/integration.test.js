const test = require('tape-async')
const { createLocalApolloFetch, connectIfNeeded, disconnect } = require('./helpers.js')

const apolloFetch = createLocalApolloFetch()

test('setup', async (t) => {
  await connectIfNeeded()
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

test('login with existing e-mail address', async (t) => {
  await connectIfNeeded()
  t.fail()
  t.end()
})

if (process.env.NODE_ENV !== 'development') {
  test('teardown', async (t) => {
    await disconnect()
    t.pass()
    t.end()
  })
}
