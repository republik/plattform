require('dotenv').config()
const test = require('tape-async')
const { apolloFetch, connectIfNeeded, pgDatabase } = require('./helpers.js')

const SUBMIT_PLEDGE_USER = {
  'firstName': 'pascal',
  'lastName': 'kaufmann',
  'email': 'pascal@reactive.one'
}

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

test('test data exists', async (t) => {
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
                'name': 'ABO_MONTHLY'
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

test('default pledge with ABO package', async (t) => {
  await connectIfNeeded()
  pgDatabase().public.pledges.truncate({ cascade: true })

  const result = await apolloFetch({
    query: PLEDGE_MUTATION,
    variables: {
      'total': 24000,
      'options': [{
        'amount': 1,
        'price': 24000,
        'templateId': '00000000-0000-0000-0008-000000000001'
      }],
      'user': SUBMIT_PLEDGE_USER,
      'reason': 'student'
    }
  })
  t.notOk(result.errors, 'graphql query successful')
  t.notEqual(result.data.submitPledge.pledgeId, null, 'pledgeId returned')
  t.notEqual(result.data.submitPledge.userId, null, 'userId returned')
  t.notEqual(result.data.submitPledge.pfAliasId, null, 'alias id returned')
  t.equal(result.data.submitPledge.emailVerify, null, 'email must not be verified, because user does not exist')
  t.ok(result.data.submitPledge.pfSHA, 'hash returned')

  const pledge = await pgDatabase().public.pledges.findOne({ id: result.data.submitPledge.pledgeId })
  t.equal(pledge.total, 24000, 'correct total value in db')

  t.comment('submit pledge again with the same e-mail address')
  const result2 = await apolloFetch({
    query: PLEDGE_MUTATION,
    variables: {
      'total': 24000,
      'options': [{
        'amount': 1,
        'price': 24000,
        'templateId': '00000000-0000-0000-0008-000000000001'
      }],
      'user': SUBMIT_PLEDGE_USER,
      'reason': 'student'
    }
  })
  t.notOk(result2.errors, 'graphql query successful')
  t.equal(result2.data.submitPledge.pledgeId, null, 'no pledgeId returned')
  t.equal(result2.data.submitPledge.userId, null, 'userId is null')
  t.equal(result2.data.submitPledge.pfAliasId, null, 'aliasId is null')
  t.equal(result2.data.submitPledge.emailVerify, true, 'email must be verified, because e-mail')
  t.equal(result2.data.submitPledge.pfSHA, null, 'no hash')
  t.end()
})

test('pledge with ABO package and donation', async (t) => {
  await connectIfNeeded()
  pgDatabase().public.pledges.truncate({ cascade: true })

  const result = await apolloFetch({
    query: PLEDGE_MUTATION,
    variables: {
      'total': 40000,
      'options': [{
        'amount': 1,
        'price': 24000,
        'templateId': '00000000-0000-0000-0008-000000000001'
      }],
      'user': SUBMIT_PLEDGE_USER,
      'reason': 'student'
    }
  })
  t.notOk(result.errors, 'graphql query successful')
  t.notEqual(result.data.submitPledge.pledgeId, null, 'pledgeId returned')
  t.ok(result.data.submitPledge.pfSHA, 'hash returned')

  const pledge = await pgDatabase().public.pledges.findOne({ id: result.data.submitPledge.pledgeId })
  t.equal(pledge.donation, 16000, 'correct donation value in db')
  t.equal(pledge.total, 40000, 'correct total value in db')
  t.end()
})

test('pledge with ABO package and userPrice', async (t) => {
  await connectIfNeeded()
  pgDatabase().public.pledges.truncate({ cascade: true })

  const result = await apolloFetch({
    query: PLEDGE_MUTATION,
    variables: {
      'total': 10000,
      'options': [{
        'amount': 1,
        'price': 24000,
        'templateId': '00000000-0000-0000-0008-000000000001'
      }],
      'user': SUBMIT_PLEDGE_USER,
      'reason': 'student'
    }
  })
  t.notOk(result.errors, 'graphql query successful')
  t.notEqual(result.data.submitPledge.pledgeId, null, 'pledgeId returned')
  t.ok(result.data.submitPledge.pfSHA, 'hash returned')

  const pledge = await pgDatabase().public.pledges.findOne({ id: result.data.submitPledge.pledgeId })
  t.equal(pledge.donation, -14000, 'minus donation value in db')
  t.equal(pledge.total, 10000, 'correct total value in db')
  t.end()
})

test('pledge with ABO package and userPrice too low (minUserPrice = 1000) is not possible', async (t) => {
  await connectIfNeeded()
  pgDatabase().public.pledges.truncate({ cascade: true })

  const result = await apolloFetch({
    query: PLEDGE_MUTATION,
    variables: {
      'total': 999,
      'options': [{
        'amount': 1,
        'price': 999,
        'templateId': '00000000-0000-0000-0008-000000000001'
      }],
      'user': SUBMIT_PLEDGE_USER,
      'reason': 'student'
    }
  })
  t.ok(result.errors, 'rollback & throws exception, no pledge created')
  t.end()
})

test('pledge with 2 x ABO (maxAmount = 1) is not possible', async (t) => {
  await connectIfNeeded()
  pgDatabase().public.pledges.truncate({ cascade: true })

  const result = await apolloFetch({
    query: PLEDGE_MUTATION,
    variables: {
      'total': 40000,
      'options': [{
        'amount': 2,
        'price': 24000,
        'templateId': '00000000-0000-0000-0008-000000000001'
      }],
      'user': SUBMIT_PLEDGE_USER,
      'reason': 'student'
    }
  })
  t.ok(result.errors, 'rollback & throws exception, no pledge created')
  t.end()
})

test('pledge with PATRON and 1 x SWEETS (minAmount = 2) is not possible', async (t) => {
  await connectIfNeeded()
  pgDatabase().public.pledges.truncate({ cascade: true })

  const result = await apolloFetch({
    query: PLEDGE_MUTATION,
    variables: {
      'total': 103000,
      'options': [{
        'amount': 1,
        'price': 100000,
        'templateId': '00000000-0000-0000-0008-000000000003'
      }, {
        'amount': 1,
        'price': 3000,
        'templateId': '00000000-0000-0000-0008-000000000004'
      }],
      'user': SUBMIT_PLEDGE_USER
    }
  })
  t.ok(result.errors, 'rollback & throws exception, no pledge created')
  t.end()
})

test('pledge with PATRON and no SWEETS (minAmount = 2) is not possible', async (t) => {
  await connectIfNeeded()
  pgDatabase().public.pledges.truncate({ cascade: true })

  const result = await apolloFetch({
    query: PLEDGE_MUTATION,
    variables: {
      'total': 103000,
      'options': [{
        'amount': 1,
        'price': 100000,
        'templateId': '00000000-0000-0000-0008-000000000003'
      }],
      'user': SUBMIT_PLEDGE_USER
    }
  })
  t.ok(result.errors, 'rollback & throws exception, no pledge created')
  t.end()
})

test('pledge with PATRON package (userPrice = false) and a total that is lower than the price is not possible', async (t) => {
  await connectIfNeeded()
  pgDatabase().public.pledges.truncate({ cascade: true })

  const result = await apolloFetch({
    query: PLEDGE_MUTATION,
    variables: {
      'total': 99999,
      'options': [{
        'amount': 1,
        'price': 10000,
        'templateId': '00000000-0000-0000-0008-000000000003'
      }],
      'user': {
        'firstName': 'pascal',
        'lastName': 'kaufmann',
        'email': 'pascal@reactive.one'
      }
    }
  })
  t.ok(result.errors, 'rollback, throws exception, no pledge created')
  t.end()
})

test('pledge with mixed PATRON package options and ABO package option is not possible', async (t) => {
  await connectIfNeeded()
  pgDatabase().public.pledges.truncate({ cascade: true })

  const result = await apolloFetch({
    query: PLEDGE_MUTATION,
    variables: {
      'total': 100000,
      'options': [{
        'amount': 1,
        'price': 100000,
        'templateId': '00000000-0000-0000-0008-000000000002'
      }, {
        'amount': 1,
        'price': 20000,
        'templateId': '00000000-0000-0000-0008-000000000001'
      }],
      'user': {
        'firstName': 'pascal',
        'lastName': 'kaufmann',
        'email': 'pascal@reactive.one'
      }
    }
  })
  t.ok(result.errors, 'rollback, throws exception, you cannot mix options of two packages')
  t.end()
})
