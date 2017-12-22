require('dotenv').config({path: '.test.env'})
const test = require('tape-async')
const { apolloFetch, connectIfNeeded, pgDatabase } = require('./helpers.js')
const { submitPledge } = require('./submitPledge.test.js')
const { createSource } = require('./stripeHelpers')
const { createTransaction } = require('./paypalHelpers')

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
  mutation payPledge($pledgeId: ID!, $method: PaymentMethod!, $sourceId: String, $pspPayload: String, $address: AddressInput, $paperInvoice: Boolean) {
    payPledge(pledgePayment: {pledgeId: $pledgeId, method: $method, sourceId: $sourceId, pspPayload: $pspPayload, address: $address, paperInvoice: $paperInvoice}) {
      pledgeId
      userId
      emailVerify
    }
  }
`

const prepareNewPledge = async () => {
  const result = await submitPledge({
    'total': 24000,
    'options': [{
      'amount': 1,
      'price': 24000,
      'templateId': '00000000-0000-0000-0008-000000000001'
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

const prepare = async () => {
  await connectIfNeeded()
  await pgDatabase().public.pledges.truncate({ cascade: true })
  const newPledge = await prepareNewPledge()
  return { ...newPledge }
}

test('pay ABO pledge with PAYMENTSLIP (post-payment)', async (t) => {
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

test('pay ABO pledge with PAYPAL', async (t) => {
  const { pledgeId } = await prepare()
  const transaction = await createTransaction()
  const result = await payPledge({
    pledgeId,
    method: PAYMENT_METHODS.PAYPAL,
    pspPayload: JSON.stringify({ tx: transaction.id })
  })
  t.notOk(result.errors, 'graphql query successful')
  const pledgePayment = await pgDatabase().public.pledgePayments.findOne({ pledgeId })
  const payment = await pgDatabase().public.payments.findOne({ id: pledgePayment.paymentId })
  t.equal(payment.status, 'PAID', 'status is PAID')
  t.end()
})

test('pay ABO pledge with STRIPE', async (t) => {
  const { pledgeId } = await prepare()
  const source = await createSource('tok_visa')
  const result = await payPledge({
    pledgeId,
    method: PAYMENT_METHODS.STRIPE,
    sourceId: source.id
  })
  t.notOk(result.errors, 'graphql query successful')
  const pledgePayment = await pgDatabase().public.pledgePayments.findOne({ pledgeId })
  const payment = await pgDatabase().public.payments.findOne({ id: pledgePayment.paymentId })
  t.equal(payment.status, 'PAID', 'status is PAID')
  t.end()
})
