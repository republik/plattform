const test = require('tape-async')
const { apolloFetch, connectIfNeeded, disconnect } = require('./helpers.js')

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
  t.ok(result.data.__schema, 'graphql schema received')
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
