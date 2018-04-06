const test = require('tape-async')
const { apolloFetch, connectIfNeeded, pgDatabase } = require('../helpers.js')
const { signIn, signOut, Users } = require('../auth.js')
const { submitPledge } = require('./submitPledge.test.js')
const { payPledge, PAYMENT_METHODS } = require('./payPledge.test.js')

const CANCEL_PLEDGE_MUTATION = `
  mutation cancelPledge($pledgeId: ID!) {
    cancelPledge(pledgeId: $pledgeId) {
      status
      memberships {
        active
      }
    }
  }
`

const cancelPledge = async ({ pledgeId }) => {
  await prepareParkingUserAndPledge()
  return apolloFetch({
    query: CANCEL_PLEDGE_MUTATION,
    variables: {
      pledgeId
    }
  })
}

module.exports = { cancelPledge }

const prepareParkingUserAndPledge = async () => {
  try {
    await pgDatabase().public.users.insert({
      id: process.env.PARKING_USER_ID,
      email: 'parking@test.project-r.construction',
      firstName: 'parking',
      lastName: 'parker'
    })
  } catch (e) {
    console.log(e)
  }
  try {
    await pgDatabase().public.pledges.insert({
      id: process.env.PARKING_PLEDGE_ID,
      userId: process.env.PARKING_USER_ID,
      packageId: '00000000-0000-0000-0007-000000000001',
      total: 0,
      donation: 0
    })
  } catch (e) {
    console.log(e)
  }
}

const prepareNewPledge = async ({ templateId } = {}) => {
  const result = await submitPledge({
    'total': 24000,
    'options': [{
      'amount': 1,
      'price': 24000,
      templateId: templateId || '00000000-0000-0000-0008-000000000001'
    }]
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
  const newPledge = await prepareNewPledge(options)
  return { ...newPledge }
}

test('cancelPledge: Unpaid ABO with PAYMENTSLIP', async (t) => {
  const { pledgeId } = await prepare()
  await signIn({ user: Users.Supporter })
  const result = await cancelPledge({
    pledgeId
  })
  t.notOk(result.errors, 'graphql query successful')
  t.deepEqual(result.data, {
    cancelPledge: { status: 'CANCELLED', memberships: [] }
  }, 'pledgestatus is CANCELLED now and no memberships generated at all')
  // check that payment is CANCELLED as well!
  const pledgePayment = await pgDatabase().public.pledgePayments.findOne({ pledgeId })
  t.notOk(pledgePayment, 'no payment, cancelled before payment')

  const membership = await pgDatabase().public.memberships.findOne({ pledgeId })
  t.notOk(membership, 'no membership')

  await signOut()
  t.end()
})

test('cancelPledge: Waiting ABO with PAYMENTSLIP', async (t) => {
  const { pledgeId } = await prepare()
  await payPledge({
    pledgeId,
    method: PAYMENT_METHODS.PAYMENTSLIP,
    paperInvoice: true
  })
  const membership = await pgDatabase().public.memberships.findOne({ pledgeId })
  t.ok(membership, 'membership exists')
  await signIn({ user: Users.Supporter })
  const result = await cancelPledge({
    pledgeId
  })
  t.notOk(result.errors, 'graphql query successful')
  t.deepEqual(result.data, {
    cancelPledge: { status: 'CANCELLED', memberships: [] }
  }, 'pledge status is CANCELLED now and membership went to parking parker')

  const parkedMembership = await pgDatabase().public.memberships.findOne({ id: membership.id })
  t.equal(parkedMembership.pledgeId, process.env.PARKING_PLEDGE_ID, 'membership should be linked with parking pledge')
  t.equal(parkedMembership.userId, process.env.PARKING_USER_ID, 'membership should be linked with parking user')

  const pledgePayment = await pgDatabase().public.pledgePayments.findOne({ pledgeId })
  t.ok(pledgePayment, 'pledge payment exists')

  const payment = await pgDatabase().public.payments.findOne({ id: pledgePayment.paymentId })
  t.ok(payment, 'payment exists')
  t.equal(payment.status, 'CANCELLED', 'payment status CANCELLED')

  const membershipAfterCancel = await pgDatabase().public.memberships.findOne({ pledgeId })
  t.notOk(membershipAfterCancel, 'there should be no membership anymore for the original pledgeId')

  await signOut()
  t.end()
})
