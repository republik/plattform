const test = require('tape-async')
const { connectIfNeeded, pgDatabase, apolloFetch } = require('../helpers.js')
const { signIn, Users } = require('../auth.js')

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

const prepare = async (options) => {
  await connectIfNeeded()
  await pgDatabase().public.payments.truncate({ cascade: true })
  await pgDatabase().public.pledgePayments.truncate({ cascade: true })
  await pgDatabase().public.pledges.truncate({ cascade: true })
  await signIn(options)
}

test('addPaymentSource: adding a source unauthenticated', async (t) => {
  await prepare({ user: Users.Anonymous })
  const result = await addPaymentSource({
    sourceId: '',
    pspPayload: ''
  })
  t.equal(result.errors[0].message, 'Sie müssen sich zuerst einloggen.', 'graphql mutation fails because not logged in')
  t.end()
})

test('addPaymentSource: adding a 3d secure credit cart is not possible', async (t) => {
  await prepare({ user: Users.Member })
  const result = await addPaymentSource({
    sourceId: '',
    pspPayload: {
      type: 'three_d_secure'
    }
  })

  t.equal(result.errors[0].message, 'Es tut uns leid, aus technischen Gründen können wir zurzeit kein Monatsabo auf eine Kreditkarte buchen, die 3D secure voraussetzt. Sie können es entweder mit einer anderen Karte versuchen und/oder uns kontaktieren unter: zahlungen@republik.ch. ', 'graphql mutation fails because not logged in')
  t.end()
})

test.only('addPaymentSource: adding an expired credit card is not possible', async (t) => {
  await prepare({ user: Users.Member })
  const result = await addPaymentSource({
    sourceId: 'TEST',
    pspPayload: {
      type: 'three_d_secure'
    }
  })

  t.equal(result.errors[0].message, 'Es tut uns leid, aus technischen Gründen können wir zurzeit kein Monatsabo auf eine Kreditkarte buchen, die 3D secure voraussetzt. Sie können es entweder mit einer anderen Karte versuchen und/oder uns kontaktieren unter: zahlungen@republik.ch. ', 'graphql mutation fails because not logged in')
  t.end()
})
