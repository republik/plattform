const test = require('tape-async')

require('dotenv').config({ path: '.test.env' })

const dedupe = require('dynamic-dedupe')
dedupe.activate()

const { PORT } = process.env

const Server = require('../../../server')
const sleep = require('await-sleep')
const { lib: { redis } } = require('@orbiting/backend-modules-base')

const GRAPHQL_URI = `http://localhost:${PORT}/graphql`
const { createApolloFetch } = require('apollo-fetch')

const apolloFetch = createApolloFetch({ uri: GRAPHQL_URI })

// shared
let pgdb

test('setup', async (t) => {
  await redis.flushdbAsync()
  await sleep(1000)
  const server = await Server.run()
  pgdb = server.pgdb
  console.log(pgdb)
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

//
// test('login with existing e-mail address', async (t) => {
//   const result = await apolloFetch({
//     query: `
//       {
//         embed(id: "2lXD0vv-ds8", embedType: YoutubeEmbed) {
//           __typename
//           ... on YoutubeEmbed {
//             id
//             userName
//           }
//         }
//       }
//     `
//   })
//   t.deepEqual(result.data.embed, {
//     __typename: 'YoutubeEmbed',
//     id: '2lXD0vv-ds8',
//     userName: 'FlyingLotusVEVO'
//   })
//   t.end()
// })

test('teardown', (t) => {
  Server.close()
  t.end()
})
