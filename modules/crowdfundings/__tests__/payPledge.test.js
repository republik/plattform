require('dotenv').config()
const test = require('tape-async')
const { apolloFetch, connectIfNeeded, pgDatabase } = require('./helpers.js')
const { submitPledge } = require('./submitPledge.test.js')

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

test('pay pledge with invoice (setup post-payment process)', async (t) => {
  const { pledgeId } = await prepare()
  const result = await payPledge({
    pledgeId,
    method: PAYMENT_METHODS.PAYMENTSLIP,
    // sourceId: '',
    // pspPayload: '',
    paperInvoice: true
  })
  console.log(result)
  t.notOk(result.errors, 'graphql query successful')
  // t.notEqual(result.data.submitPledge.pledgeId, null, 'pledgeId returned')
  // t.notEqual(result.data.submitPledge.userId, null, 'userId returned')
  // t.notEqual(result.data.submitPledge.pfAliasId, null, 'alias id returned')
  // t.equal(result.data.submitPledge.emailVerify, null, 'email must not be verified, because user does not exist')
  // t.ok(result.data.submitPledge.pfSHA, 'hash returned')

  // const pledge = await pgDatabase().public.pledges.findOne({ id: result.data.submitPledge.pledgeId })
  // t.equal(pledge.total, 24000, 'correct total value in db')
  t.end()
})
