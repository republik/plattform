const test = require('tape-async')
const { apolloFetch, connectIfNeeded, pgDatabase } = require('../helpers.js')
const { signIn, signOut, Users } = require('../auth.js')
const { submitPledge } = require('./submitPledge.test.js')
const { payPledge, PAYMENT_METHODS } = require('./payPledge.test.js')
const { cancelPledge } = require('./cancelPledge.test.js')

const UPDATE_PAYMENT_MUTATION = `
  mutation updatePayment($paymentId: ID!, $status: PaymentStatus!, $reason: String) {
    updatePayment(paymentId: $paymentId, status: $status, reason: $reason) {
      status
    }
  }
`

const updatePayment = async ({ paymentId, status, reason }) => {
  return apolloFetch({
    query: UPDATE_PAYMENT_MUTATION,
    variables: {
      paymentId,
      status,
      reason
    }
  })
}

module.exports = { updatePayment }

const prepareNewPaidPledge = async ({ templateId } = {}) => {
  const result = await submitPledge({
    'total': 24000,
    'options': [{
      'amount': 1,
      'price': 24000,
      templateId: templateId || '00000000-0000-0000-0008-000000000001'
    }]
  })
  const pledgeId = result.data.submitPledge.pledgeId
  const userId = result.data.submitPledge.userId
  await payPledge({
    pledgeId,
    method: PAYMENT_METHODS.PAYMENTSLIP,
    paperInvoice: true
  })
  return {
    pledgeId,
    userId
  }
}

const prepare = async (options) => {
  await connectIfNeeded()
  await pgDatabase().public.payments.truncate({ cascade: true })
  await pgDatabase().public.pledgePayments.truncate({ cascade: true })
  await pgDatabase().public.pledges.truncate({ cascade: true })
  const newPledge = await prepareNewPaidPledge(options)
  return { ...newPledge }
}

test('updatePayment: WAITING -> CANCELLED', async (t) => {
  const { pledgeId } = await prepare()
  await signIn({ user: Users.Supporter })
  const status = 'CANCELLED'
  const { paymentId } = await pgDatabase().public.pledgePayments.findFirst({ pledgeId })
  const result = await updatePayment({
    paymentId,
    status,
    reason: 'WAITING -> CANCELLED'
  })
  t.ok(result.errors, 'invalid transition')

  await signOut()
  t.end()
})

test('updatePayment: WAITING -> WAITING_FOR_REFUND', async (t) => {
  const { pledgeId } = await prepare()
  await signIn({ user: Users.Supporter })
  const status = 'WAITING_FOR_REFUND'
  const { paymentId } = await pgDatabase().public.pledgePayments.findFirst({ pledgeId })
  const result = await updatePayment({
    paymentId,
    status,
    reason: 'WAITING -> WAITING_FOR_REFUND'
  })
  t.ok(result.errors, 'invalid transition')

  await signOut()
  t.end()
})

test('updatePayment: WAITING -> REFUNDED', async (t) => {
  const { pledgeId } = await prepare()
  await signIn({ user: Users.Supporter })
  const status = 'WAITING_FOR_REFUND'
  const { paymentId } = await pgDatabase().public.pledgePayments.findFirst({ pledgeId })
  const result = await updatePayment({
    paymentId,
    status,
    reason: 'WAITING -> REFUNDED'
  })
  t.ok(result.errors, 'invalid transition')

  await signOut()
  t.end()
})

test('updatePayment: WAITING -> PAID', async (t) => {
  const { pledgeId } = await prepare()
  await signIn({ user: Users.Supporter })
  const status = 'PAID'
  const { paymentId } = await pgDatabase().public.pledgePayments.findFirst({ pledgeId })
  const result = await updatePayment({
    paymentId,
    status,
    reason: 'WAITING -> PAID'
  })
  t.notOk(result.errors, 'graphql mutation successful')
  t.deepEqual(result.data, {
    updatePayment: { status }
  }, `payment status is ${status} now and no memberships generated at all`)

  await signOut()
  t.end()
})

test('updatePayment: WAITING_FOR_REFUND -> REFUNDED', async (t) => {
  const { pledgeId } = await prepare()
  await signIn({ user: Users.Supporter })
  const { paymentId } = await pgDatabase().public.pledgePayments.findFirst({ pledgeId })

  // WAITING -> PAID
  await updatePayment({
    paymentId,
    status: 'PAID',
    reason: 'WAITING_FOR_REFUND -> REFUNDED'
  })
  // PAID -> WAITING_FOR_REFUND
  await cancelPledge({ pledgeId })

  // WAITING_FOR_REFUND -> REFUNDED
  const result = await updatePayment({
    paymentId,
    status: 'REFUNDED',
    reason: 'WAITING_FOR_REFUND -> REFUNDED'
  })
  t.notOk(result.errors, 'graphql mutation successful')
  t.deepEqual(result.data, {
    updatePayment: { status: 'REFUNDED' }
  }, `payment status is REFUNDED now and no memberships generated at all`)

  await signOut()
  t.end()
})
