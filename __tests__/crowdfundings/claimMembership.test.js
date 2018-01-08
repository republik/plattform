const test = require('tape-async')
const { apolloFetch, connectIfNeeded, pgDatabase } = require('../helpers.js')
const { signIn, signOut, Users } = require('../auth.js')
const { submitPledge } = require('./submitPledge.test.js')
const { payPledge, PAYMENT_METHODS } = require('./payPledge.test.js')

const CLAIM_MEMBERSHIP = `
  mutation claimMembership($voucherCode: String!) {
    claimMembership(voucherCode: $voucherCode)
  }
`

const claimMembership = async ({ voucherCode }) => {
  return apolloFetch({
    query: CLAIM_MEMBERSHIP,
    variables: {
      voucherCode
    }
  })
}

module.exports = { claimMembership }

const prepareNewPledge = async ({ templateId, ...options }) => {
  const result = await submitPledge({
    'total': 24000,
    'options': [{
      'amount': 1,
      'price': 24000,
      templateId
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

test('claimMembership: Claim a membership with package isAutoActivateUserMembership disabled', async (t) => {
  await prepare()
  const { pledgeId } = await prepareNewPledge({ templateId: '00000000-0000-0000-0008-000000000006' })
  await payPledge({
    pledgeId,
    method: PAYMENT_METHODS.PAYMENTSLIP,
    paperInvoice: true
  })
  const membership = await pgDatabase().public.memberships.findFirst({ pledgeId })
  t.ok(membership, 'membership generated')
  const { voucherCode } = membership
  t.ok(voucherCode, 'voucherCode was generated')

  await signIn({ user: Users.Member })
  const result = await claimMembership({ voucherCode })
  t.deepEqual(result, { data: { claimMembership: true } }, 'claimMembership should return success')
  const membershipAfterClaim = await pgDatabase().public.memberships.findFirst({ pledgeId })
  t.equal(membershipAfterClaim.userId, Users.Member.id, 'user should be "Member"')

  await signOut()
  t.end()
})

test.only('claimMembership: Claim a membership with package isAutoActivateUserMembership enabled', async (t) => {
  await prepare()
  const { pledgeId } = await prepareNewPledge({ templateId: '00000000-0000-0000-0008-000000000001' })
  await payPledge({
    pledgeId,
    method: PAYMENT_METHODS.PAYMENTSLIP,
    paperInvoice: true
  })
  const membership = await pgDatabase().public.memberships.findFirst({ pledgeId })
  t.ok(membership, 'membership generated')
  const { voucherCode } = membership
  t.notOk(voucherCode, 'voucherCode should equal null')

  await signIn({ user: Users.Member })
  const result = await claimMembership({ voucherCode: 'TEST' })
  t.ok(result.errors[0].message, 'claimMembership should fail becuase voucherCode does not exist')
  const membershipAfterClaim = await pgDatabase().public.memberships.findFirst({ pledgeId })
  t.notEqual(membershipAfterClaim.userId, Users.Member.id, 'user should not have changed')

  await signOut()
  t.end()
})
