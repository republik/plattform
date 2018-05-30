const test = require('tape-async')
const { apolloFetch, connectIfNeeded, pgDatabase } = require('../helpers.js')
const { Users } = require('../auth.js')

const SUBMIT_PLEDGE_MUTATION = `
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

const prepare = async () => {
  await connectIfNeeded()
  await pgDatabase().public.pledges.truncate({ cascade: true })
}

const submitPledge = async ({ user: userObject, ...variables }) => {
  const { email, firstName, lastName, birthday, phoneNumber } = (userObject || Users.Unverified)
  return apolloFetch({
    query: SUBMIT_PLEDGE_MUTATION,
    variables: {
      user: {
        email,
        firstName,
        lastName,
        birthday,
        phoneNumber
      },
      ...variables
    }
  })
}

module.exports = { submitPledge }

test('submitPledge: default pledge with ABO package', async (t) => {
  await prepare()
  const result = await submitPledge({
    'total': 24000,
    'options': [{
      'amount': 1,
      'price': 24000,
      'templateId': '00000000-0000-0000-0008-000000000001'
    }]
  })
  t.notOk(result.errors, 'graphql query successful')
  t.notEqual(result.data.submitPledge.pledgeId, null, 'pledgeId returned')
  t.notEqual(result.data.submitPledge.userId, null, 'userId returned')
  t.notEqual(result.data.submitPledge.pfAliasId, null, 'alias id returned')
  t.equal(result.data.submitPledge.emailVerify, null, 'email must not be verified, because user does not exist')
  t.ok(result.data.submitPledge.pfSHA, 'hash returned')

  const membership = await pgDatabase().public.memberships.count({ pledgeId: result.data.submitPledge.pledgeId })
  t.ok(!membership, 'no membership')

  const pledge = await pgDatabase().public.pledges.findOne({ id: result.data.submitPledge.pledgeId })
  t.equal(pledge.total, 24000, 'correct total value in db')

  t.comment('submit pledge again with the same e-mail address')
  const result2 = await submitPledge({
    'total': 24000,
    'options': [{
      'amount': 1,
      'price': 24000,
      'templateId': '00000000-0000-0000-0008-000000000001'
    }]
  })
  t.notOk(result2.errors, 'graphql query successful')
  t.equal(result2.data.submitPledge.pledgeId, null, 'no pledgeId returned')
  t.equal(result2.data.submitPledge.userId, null, 'userId is null')
  t.equal(result2.data.submitPledge.pfAliasId, null, 'aliasId is null')
  t.equal(result2.data.submitPledge.emailVerify, true, 'email must be verified, because e-mail')
  t.equal(result2.data.submitPledge.pfSHA, null, 'no hash')
  const membership2 = await pgDatabase().public.memberships.count({ pledgeId: result2.data.submitPledge.pledgeId })
  t.ok(!membership2, 'no membership')

  t.end()
})

test('submitPledge: pledge with ABO package and donation', async (t) => {
  await prepare()
  const result = await submitPledge({
    'total': 40000,
    'options': [{
      'amount': 1,
      'price': 24000,
      'templateId': '00000000-0000-0000-0008-000000000001'
    }]
  })
  t.notOk(result.errors, 'graphql query successful')
  t.notEqual(result.data.submitPledge.pledgeId, null, 'pledgeId returned')
  t.ok(result.data.submitPledge.pfSHA, 'hash returned')

  const pledge = await pgDatabase().public.pledges.findOne({ id: result.data.submitPledge.pledgeId })
  t.equal(pledge.donation, 16000, 'correct donation value in db')
  t.equal(pledge.total, 40000, 'correct total value in db')
  t.end()
})

test('submitPledge: pledge with ABO package and userPrice', async (t) => {
  await prepare()
  const result = await submitPledge({
    'total': 10000,
    'options': [{
      'amount': 1,
      'price': 24000,
      'templateId': '00000000-0000-0000-0008-000000000001'
    }],
    reason: 'testing the reason'
  })
  t.notOk(result.errors, 'graphql query successful')
  t.notEqual(result.data.submitPledge.pledgeId, null, 'pledgeId returned')
  t.ok(result.data.submitPledge.pfSHA, 'hash returned')

  const pledge = await pgDatabase().public.pledges.findOne({ id: result.data.submitPledge.pledgeId })
  t.equal(pledge.donation, -14000, 'minus donation value in db')
  t.equal(pledge.total, 10000, 'correct total value in db')
  t.end()
})

test('submitPledge: pledge with userPrice but no reason', async (t) => {
  await connectIfNeeded()
  pgDatabase().public.pledges.truncate({ cascade: true })
  const result = await submitPledge({
    'total': 10000,
    'options': [{
      'amount': 1,
      'price': 24000,
      'templateId': '00000000-0000-0000-0008-000000000001'
    }]
  })
  t.ok(result.errors, 'no reason, no pledge')
  t.end()
})

test('submitPledge: pledge with ABO package and userPrice too low (minUserPrice = 1000) is not possible', async (t) => {
  await prepare()
  const result = await submitPledge({
    'total': 999,
    'options': [{
      'amount': 1,
      'price': 999,
      'templateId': '00000000-0000-0000-0008-000000000001'
    }]
  })
  t.ok(result.errors, 'userPrice too low, no pledge')
  t.end()
})

test('submitPledge: pledge with 2 x ABO (maxAmount = 1) is not possible', async (t) => {
  await prepare()
  const result = await submitPledge({
    'total': 40000,
    'options': [{
      'amount': 2,
      'price': 24000,
      'templateId': '00000000-0000-0000-0008-000000000001'
    }]
  })
  t.ok(result.errors, 'amount too high, no pledge')
  t.end()
})

test('submitPledge: pledge with PATRON and 1 x SWEETS (minAmount = 2) is not possible', async (t) => {
  await prepare()
  const result = await submitPledge({
    'total': 103000,
    'options': [{
      'amount': 1,
      'price': 100000,
      'templateId': '00000000-0000-0000-0008-000000000003'
    }, {
      'amount': 1,
      'price': 3000,
      'templateId': '00000000-0000-0000-0008-000000000004'
    }]
  })
  t.ok(result.errors, 'amount too low, no pledge')
  t.end()
})

test('submitPledge: pledge with PATRON package (userPrice = false) and a total that is lower than the price is not possible', async (t) => {
  await prepare()
  const result = await submitPledge({
    'total': 99999,
    'options': [{
      'amount': 1,
      'price': 10000,
      'templateId': '00000000-0000-0000-0008-000000000003'
    }]
  })
  t.ok(result.errors, 'total lower than price, no pledge')
  t.end()
})

test('submitPledge: pledge with mixed PATRON package options and ABO package option is not possible', async (t) => {
  await prepare()
  const result = await submitPledge({
    'total': 100000,
    'options': [{
      'amount': 1,
      'price': 100000,
      'templateId': '00000000-0000-0000-0008-000000000002'
    }, {
      'amount': 1,
      'price': 20000,
      'templateId': '00000000-0000-0000-0008-000000000001'
    }]
  })
  t.ok(result.errors, 'cannot mix options of two packages, no pledge')
  t.end()
})
