const test = require('tape-async')
const { apolloFetch, connectIfNeeded, pgDatabase } = require('../helpers.js')
const { signIn, signOut, Users } = require('../auth.js')
const { submitPledge } = require('./submitPledge.test.js')

const RECLAIM_PLEDGE_MUTATION = `
  mutation reclaimPledge($pledgeId: ID!) {
    reclaimPledge(pledgeId: $pledgeId)
  }
`

const reclaimPledge = async ({ pledgeId }) => {
  return apolloFetch({
    query: RECLAIM_PLEDGE_MUTATION,
    variables: {
      pledgeId
    }
  })
}

module.exports = { reclaimPledge }

const prepareNewPledge = async (options) => {
  const result = await submitPledge({
    'total': 24000,
    'options': [{
      'amount': 1,
      'price': 24000,
      templateId: '00000000-0000-0000-0008-000000000001'
    }],
    ...options
  })
  return {
    pledgeId: result.data.submitPledge.pledgeId,
    userId: result.data.submitPledge.userId
  }
}

const prepare = async (options) => {
  await connectIfNeeded()
  await pgDatabase().public.payments.truncate({ cascade: true })
  await pgDatabase().public.pledgePayments.truncate({ cascade: true })
  await pgDatabase().public.pledges.truncate({ cascade: true })
}

test('reclaimPledge: Claim a pledge of a unverified user as nobody', async (t) => {
  await prepare()
  const { pledgeId } = await prepareNewPledge()
  const result = await reclaimPledge({
    pledgeId
  })
  console.log(result)
  t.ok(result.errors, 'unauthorized')
  t.end()
})

test('reclaimPledge: Claim a pledge of a unverified user as verified user', async (t) => {
  await prepare()
  const { pledgeId } = await prepareNewPledge({ user: Users.Unverified })
  await signIn({ user: Users.Member })
  const result = await reclaimPledge({
    pledgeId
  })
  console.log(result)
  t.ok(result.data.reclaimPledge, 'reclaim returns true')
  await signOut()
  t.end()
})

test('reclaimPledge: Claim a pledge of a verified user as unverified user', async (t) => {
  await prepare()
  const { pledgeId } = await prepareNewPledge({ user: Users.Member })
  await signIn({ user: Users.Unverified })
  const result = await reclaimPledge({
    pledgeId
  })
  console.log(result)
  t.ok(result.errors, 'is not possible')
  await signOut()
  t.end()
})

test('reclaimPledge: Claim a pledge of a verified user as a supporter', async (t) => {
  await prepare()
  const { pledgeId } = await prepareNewPledge({ user: Users.Member })
  await signIn({ user: Users.Supporter })
  const result = await reclaimPledge({
    pledgeId
  })
  console.log(result)
  t.ok(result.errors, 'is not possible')
  await signOut()
  t.end()
})
