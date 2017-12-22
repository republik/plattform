require('dotenv').config()
const test = require('tape-async')
const { apolloFetch, connectIfNeeded, pgDatabase } = require('./helpers.js')

const PLEDGE_MUTATION = `
  mutation submitPledge($total: Int!, $options: [PackageOptionInput!]!, $user: UserInput!, $reason: String) {
    submitPledge(pledge: {total: $total, options: $options, user: $user, reason: $reason}) {
      pledgeId
      userId
      emailVerify
      pfAliasId
      pfSHA
    }
  }
`

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

test('submit default pledge with no donation, anonymous', async (t) => {
  await connectIfNeeded()
  pgDatabase().public.pledges.truncate({ cascade: true })

  const result = await apolloFetch({
    query: PLEDGE_MUTATION,
    variables: {
      'total': 2400000,
      'options': [{
        'amount': 1,
        'price': 2400000,
        'templateId': '00000000-0000-0000-0008-000000000001'
      }],
      'user': {
        'firstName': 'pascal',
        'lastName': 'kaufmann',
        'email': 'pascal@reactive.one'
      },
      'reason': 'student'
    }
  })
  t.notOk(result.errors, 'no error returned')
  t.notEqual(result.data.submitPledge.pledgeId, null, 'pledgeId returned')
  t.notEqual(result.data.submitPledge.userId, null, 'userId returned')
  t.notEqual(result.data.submitPledge.pfAliasId, null, 'alias id returned')
  t.equal(result.data.submitPledge.emailVerify, null, 'email must not be verified, because user does not exist')
  t.ok(result.data.submitPledge.pfSHA, 'hash returned')

  t.comment('submit the pledge again with the same e-mail address')

  const result2 = await apolloFetch({
    query: PLEDGE_MUTATION,
    variables: {
      'total': 2400000,
      'options': [{
        'amount': 1,
        'price': 2400000,
        'templateId': '00000000-0000-0000-0008-000000000001'
      }],
      'user': {
        'firstName': 'pascal',
        'lastName': 'kaufmann',
        'email': 'pascal@reactive.one'
      },
      'reason': 'student'
    }
  })
  t.notOk(result2.errors, 'no error returned')
  t.equal(result2.data.submitPledge.pledgeId, null, 'no pledgeId returned')
  t.equal(result2.data.submitPledge.userId, null, 'userId is null')
  t.equal(result2.data.submitPledge.pfAliasId, null, 'aliasId is null')
  t.equal(result2.data.submitPledge.emailVerify, true, 'email must be verified, because e-mail')
  t.equal(result2.data.submitPledge.pfSHA, null, 'no hash')
  t.end()
})
