require('dotenv').config({path: '.test.env'})
const test = require('tape-async')
const { apolloFetch, connectIfNeeded } = require('../helpers.js')

test('crowdfundings test data exists', async (t) => {
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
          'name': 'MONTHLY_ABO',
          'options': [
            {
              'id': '00000000-0000-0000-0008-000000000002',
              'price': 2000,
              'userPrice': false,
              'minAmount': 1,
              'maxAmount': 1,
              'defaultAmount': 1,
              'reward': {
                'id': '00000000-0000-0000-0006-000000000002',
                'name': 'MONTHLY_ABO'
              }
            }
          ]
        },
        {
          'id': '00000000-0000-0000-0007-000000000003',
          'name': 'PATRON',
          'options': [
            {
              'id': '00000000-0000-0000-0008-000000000003',
              'price': 100000,
              'userPrice': false,
              'minAmount': 1,
              'maxAmount': 1,
              'defaultAmount': 1,
              'reward': {
                'id': '00000000-0000-0000-0006-000000000001',
                'name': 'ABO'
              }
            },
            {
              'id': '00000000-0000-0000-0008-000000000004',
              'price': 3000,
              'userPrice': false,
              'minAmount': 2,
              'maxAmount': 10,
              'defaultAmount': 5,
              'reward': {
                'id': '00000000-0000-0000-0005-000000000001',
                'name': 'SWEETS'
              }
            }
          ]
        },
        {
          'id': '00000000-0000-0000-0007-000000000004',
          'name': 'DONATION',
          'options': [
            {
              'id': '00000000-0000-0000-0008-000000000005',
              'price': 1,
              'userPrice': true,
              'minAmount': 1,
              'maxAmount': 1,
              'defaultAmount': 1,
              'reward': null
            }
          ]
        }
      ]
    }
  }, 'test data exists and looks good')
  t.end()
})
