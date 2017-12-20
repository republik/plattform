require('dotenv').config()
const test = require('tape-async')
const { apolloFetch, connectIfNeeded } = require('./helpers.js')

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

test('check test data existence', async (t) => {
  await connectIfNeeded()
  const result = await apolloFetch({
    query: `
      {
        crowdfunding(name: "TEST") {
          id
          name
          packages {
            id
            name
            options {
              id
              price
              userPrice
              minAmount
              maxAmount
              defaultAmount
              reward {
                ... on MembershipType {
                  id
                  name
                }
                ... on Goodie {
                  id
                  name
                }
              }
            }
          }
        }
      }
    `
  })
  t.deepEqual(result.data, {
    'crowdfunding': {
      'id': 'f0000000-0000-0000-0002-000000000001',
      'name': 'TEST',
      'packages': [
        {
          'id': '00000000-0000-0000-0007-000000000001',
          'name': 'ABO',
          'options': [
            {
              'id': '00000000-0000-0000-0008-000000000001',
              'price': 24000,
              'userPrice': true,
              'minAmount': 1,
              'maxAmount': 1,
              'defaultAmount': 1,
              'reward': {
                'id': '00000000-0000-0000-0006-000000000001',
                'name': 'ABO'
              }
            }
          ]
        },
        {
          'id': '00000000-0000-0000-0007-000000000002',
          'name': 'ABO_MONTHLY',
          'options': []
        }
      ]
    }
  }, 'test data exists and looks good')
  t.end()
})
