const test = require('tape-async')
const moment = require('moment')
const { apolloFetch, connectIfNeeded, pgDatabase } = require('../helpers.js')
const { submitPledge } = require('./submitPledge.test.js')
const {
  Cards,
  createSource,
  invoicePaymentSuccess,
  chargeSuccess,
  resetCustomers,
  invoicePaymentFail,
  cancelSubscription } = require('./stripeHelpers')
// const { createTransaction } = require('./paypalHelpers')

const PAYMENT_METHODS = {
  STRIPE: 'STRIPE',
  POSTFINANCECARD: 'POSTFINANCECARD',
  PAYPAL: 'PAYPAL',
  PAYMENTSLIP: 'PAYMENTSLIP'
}

const PAY_PLEDGE_ADDRESS = {
  name: 'willhelm tell',
  line1: 'street 123',
  line2: '',
  postalCode: '8000',
  city: 'zurich',
  country: 'CH'
}

const PAY_PLEDGE_MUTATION = `
  mutation payPledge($pledgeId: ID!, $method: PaymentMethod!, $sourceId: String, $pspPayload: JSON, $address: AddressInput, $paperInvoice: Boolean) {
    payPledge(pledgePayment: {pledgeId: $pledgeId, method: $method, sourceId: $sourceId, pspPayload: $pspPayload, address: $address, paperInvoice: $paperInvoice}) {
      pledgeId
      userId
      emailVerify
    }
  }
`

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

const payPledge = async ({ method, ...variables }) => {
  return apolloFetch({
    query: PAY_PLEDGE_MUTATION,
    variables: {
      address: PAY_PLEDGE_ADDRESS,
      method: PAYMENT_METHODS[method],
      ...variables
    }
  })
}

module.exports = { payPledge, PAYMENT_METHODS }

const prepare = async (options) => {
  await connectIfNeeded()
  await pgDatabase().public.payments.truncate({ cascade: true })
  await pgDatabase().public.pledgePayments.truncate({ cascade: true })
  await pgDatabase().public.pledges.truncate({ cascade: true })
  const newPledge = await prepareNewPledge(options)
  return { ...newPledge }
}

test('payPledge: ABO pledge with PAYMENTSLIP (post-payment)', async (t) => {
  const { pledgeId } = await prepare()
  const result = await payPledge({
    pledgeId,
    method: PAYMENT_METHODS.PAYMENTSLIP,
    paperInvoice: true
  })
  t.notOk(result.errors, 'graphql query successful')
  const pledgePayment = await pgDatabase().public.pledgePayments.findOne({ pledgeId })
  const payment = await pgDatabase().public.payments.findOne({ id: pledgePayment.paymentId })
  t.equal(payment.status, 'WAITING', 'status is WAITING')
  t.end()
})

// test('payPledge: ABO pledge with PAYPAL', async (t) => {
//   const { pledgeId } = await prepare()
//   const transaction = await createTransaction()
//   const result = await payPledge({
//     pledgeId,
//     method: PAYMENT_METHODS.PAYPAL,
//     pspPayload: { tx: transaction.id }
//   })
//   t.notOk(result.errors, 'graphql query successful')
//   const pledgePayment = await pgDatabase().public.pledgePayments.findOne({ pledgeId })
//   const payment = await pgDatabase().public.payments.findOne({ id: pledgePayment.paymentId })
//   t.equal(payment.status, 'PAID', 'status is PAID')
//   t.end()
// })

test('payPledge: ABO pledge with STRIPE', async (t) => {
  const { pledgeId } = await prepare()
  await resetCustomers(pgDatabase())
  const source = await createSource({ card: Cards.Visa, pledgeId })
  const result = await payPledge({
    pledgeId,
    method: PAYMENT_METHODS.STRIPE,
    sourceId: source.id
  })
  t.notOk(result.errors, 'graphql query successful')
  const pledgePayment = await pgDatabase().public.pledgePayments.findOne({ pledgeId })
  const payment = await pgDatabase().public.payments.findOne({ id: pledgePayment.paymentId })
  t.equal(payment.status, 'PAID', 'status is PAID')

  const membership = await pgDatabase().public.memberships.findOne({ pledgeId })
  t.equal(membership.active, true, 'membership is active')
  t.equal(membership.voucherable, false, 'membership is not voucherable')

  const periods = await pgDatabase().public.membershipPeriods.find({ membershipId: membership.id })
  t.ok(periods.length === 1, 'exactly 1 membership period generated')
  t.ok(moment().add('1', 'year').isAfter(moment(periods[0].endDate)), 'membership ends after 1 year from now')

  t.end()
})

test('payPledge: MONTHLY_ABO pledge with STRIPE', async (t) => {
  const { pledgeId } = await prepare({ templateId: '00000000-0000-0000-0008-000000000002' })
  await resetCustomers(pgDatabase())
  const source = await createSource({ card: Cards.Visa, pledgeId })
  const result = await payPledge({
    pledgeId,
    method: PAYMENT_METHODS.STRIPE,
    sourceId: source.id
  })
  t.notOk(result.errors, 'graphql query successful')

  const pledgePaymentBeforeCharge = await pgDatabase().public.pledgePayments.findOne({ pledgeId })
  t.notOk(pledgePaymentBeforeCharge, 'in subscription mode, pledgePayments are added after payPledge (by webhooks)')

  // simulate successful payment of the pledge
  await invoicePaymentSuccess({
    pledgeId,
    total: 24000,
    chargeId: 'TEST',
    start: Math.floor(Date.now() / 1000),
    end: Math.floor(Date.now() / 1000) + 86400 // 24 hours
  }, pgDatabase())

  await chargeSuccess({
    chargeId: 'TEST',
    total: 24000
  }, pgDatabase())

  const pledgePayment = await pgDatabase().public.pledgePayments.findOne({ pledgeId })
  const payment = await pgDatabase().public.payments.findOne({ id: pledgePayment.paymentId })
  t.equal(payment.status, 'PAID', 'pledgePayment exists and status is PAID after webhooks triggered')

  const membership = await pgDatabase().public.memberships.findOne({ pledgeId })
  t.equal(membership.active, true, 'membership is active')
  t.equal(membership.voucherable, false, 'membership is not voucherable')

  const periods = await pgDatabase().public.membershipPeriods.find({ membershipId: membership.id })
  t.ok(periods.length === 1, 'exactly 1 membership period generated')
  t.ok(moment().add('1', 'month').isAfter(moment(periods[0].endDate)), 'membership ends after 1 month from now')
  t.end()
})

test('payPledge: Membership that never got charged successfully on MONTHLY_ABO pledge with STRIPE', async (t) => {
  const { pledgeId } = await prepare({ templateId: '00000000-0000-0000-0008-000000000002' })
  await resetCustomers(pgDatabase())
  const source = await createSource({ card: Cards.Untrusted, pledgeId })
  const result = await payPledge({
    pledgeId,
    method: PAYMENT_METHODS.STRIPE,
    sourceId: source.id
  })
  t.notOk(result.errors, 'graphql query successful')

  // simulate failed payment of the pledge
  await invoicePaymentFail({
    pledgeId
  }, pgDatabase())

  const pledgePayment = await pgDatabase().public.pledgePayments.findOne({ pledgeId })
  t.notOk(pledgePayment, 'no pledgePayment')

  const membership = await pgDatabase().public.memberships.findOne({ pledgeId })
  t.ok(membership.latestPaymentFailedAt, 'membership last payment failed date exists')
  t.equal(membership.active, true, 'membership still active, we will send a reminder before disabling')
  t.equal(membership.voucherable, false, 'membership is not voucherable')

  const periods = await pgDatabase().public.membershipPeriods.find({ membershipId: membership.id })
  t.equal(periods.length, 1, 'one membership period')
  t.end()
})

test('payPledge: Multiple failed payments on MONTHLY_ABO pledge with STRIPE', async (t) => {
  const { pledgeId } = await prepare({ templateId: '00000000-0000-0000-0008-000000000002' })
  await resetCustomers(pgDatabase())
  const source = await createSource({ card: Cards.Visa, pledgeId })
  const result = await payPledge({
    pledgeId,
    method: PAYMENT_METHODS.STRIPE,
    sourceId: source.id
  })
  t.notOk(result.errors, 'graphql query successful')

  // simulate successful payment of the pledge
  await invoicePaymentFail({
    pledgeId
  }, pgDatabase())

  // triggered from stripe subscription, this happens after X tries to charge
  await cancelSubscription({
    pledgeId,
    status: 'canceled',
    atPeriodEnd: false
  }, pgDatabase())

  const membership = await pgDatabase().public.memberships.findOne({ pledgeId })
  t.equal(membership.active, false, 'membership is not active anymore')

  const periods = await pgDatabase().public.membershipPeriods.find({ membershipId: membership.id })
  t.equal(periods.length, 1, 'one membership period')
  t.end()
})
