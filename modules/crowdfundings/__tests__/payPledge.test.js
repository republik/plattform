require('dotenv').config()
const test = require('tape-async')
const { connectIfNeeded, pgDatabase } = require('./helpers.js')

// const PAY_PLEDGE_ADDRESS = {
//   name: 'willhelm tell',
//   line1: 'street 123',
//   line2: '',
//   postalCode: '8000',
//   city: 'zurich',
//   country: 'CH'
// }
//
// const PAY_PLEDGE_MUTATION = `
//   mutation payPledge($pledgeId: ID!, $method: PaymentMethod!, $sourceId: String, $pspPayload: String, $address: AddressInput, $paperInvoice: Boolean) {
//     payPledge(pledgePayment: {pledgeId: $pledgeId, method: $method, sourceId: $sourceId, pspPayload: $pspPayload, address: $address, paperInvoice: $paperInvoice}) {
//       pledgeId
//       userId
//       emailVerify
//     }
//   }
// `

const prepare = async () => {
  await connectIfNeeded()
  await pgDatabase().public.pledges.truncate({ cascade: true })
}

test('pay pledge with invoice (setup post-payment process)', async (t) => {
  await prepare()
  // const result = await apolloFetch({
  //   query: PAY_PLEDGE_MUTATION,
  //   variables: {
  //     pledgeId: 24000,
  //     method: '',
  //     sourceId: '',
  //     pspPayload: '',
  //     address: PAY_PLEDGE_ADDRESS,
  //     paperInvoice: true
  //   }
  // })
  // t.notOk(result.errors, 'graphql query successful')
  // t.notEqual(result.data.submitPledge.pledgeId, null, 'pledgeId returned')
  // t.notEqual(result.data.submitPledge.userId, null, 'userId returned')
  // t.notEqual(result.data.submitPledge.pfAliasId, null, 'alias id returned')
  // t.equal(result.data.submitPledge.emailVerify, null, 'email must not be verified, because user does not exist')
  // t.ok(result.data.submitPledge.pfSHA, 'hash returned')
  //
  // const pledge = await pgDatabase().public.pledges.findOne({ id: result.data.submitPledge.pledgeId })
  // t.equal(pledge.total, 24000, 'correct total value in db')
  t.fail('tbd')
  t.end()
})
