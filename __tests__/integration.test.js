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

test.onFinish(() => {
  if (process.env.NODE_ENV !== 'development') {
    disconnect()
  }
})
