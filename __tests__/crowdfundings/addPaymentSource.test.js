const test = require('tape-async')
const { connectIfNeeded, pgDatabase, apolloFetch, loginUser } = require('../helpers.js')

const PAY_PLEDGE_MUTATION = `
  mutation addPaymentSource($sourceId: String!, $pspPayload: JSON!) {
    addPaymentSource(sourceId: $sourceId, pspPayload: $pspPayload) {
      id
      isDefault
      status
      brand
      last4
      expMonth
      expYear
    }
  }
`

const addPaymentSource = async ({ sourceId, pspPayload }) => {
  return apolloFetch({
    query: PAY_PLEDGE_MUTATION,
    variables: {
      sourceId,
      pspPayload
    }
  })
}

const prepare = async (...args) => {
  await connectIfNeeded()
  await pgDatabase().public.payments.truncate({ cascade: true })
  await pgDatabase().public.pledgePayments.truncate({ cascade: true })
  await pgDatabase().public.pledges.truncate({ cascade: true })
  await loginUser(...args)
}

test('test adding a source unauthenticated', async (t) => {
  await prepare(loginUser.Anonymous)
  const result = await addPaymentSource({
    sourceId: '',
    pspPayload: ''
  })
  t.equal(result.errors[0].message, 'Sie müssen sich zuerst einloggen.', 'graphql mutation fails because not logged in')
  t.end()
})

test.only('test adding a 3d secure credit cart is not possible', async (t) => {
  await prepare(loginUser.Unverified)
  const result = await addPaymentSource({
    sourceId: 'TEST',
    pspPayload: JSON.stringify({
      type: 'three_d_secure'
    })
  })
  t.equal(result.errors[0].message, 'Sie müssen sich zuerst einloggen.', 'graphql mutation fails because not logged in')
  t.end()
})
