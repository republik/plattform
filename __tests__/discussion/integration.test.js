require('dotenv').config({path: '.test.env'})
const test = require('tape-async')
const { apolloFetch, connectIfNeeded } = require('../helpers.js')

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
