const test = require('tape-async')
const { connectIfNeeded, pgDatabase, apolloFetch } = require('../helpers.js')
const { signIn, signOut, Users } = require('../auth.js')
const {
  Cards,
  createSource,
  resetCustomers
  } = require('./stripeHelpers')

const PAY_PLEDGE_MUTATION = `
  mutation addPaymentSource($sourceId: String!, $pspPayload: JSON!) {
    addPaymentSource(sourceId: $sourceId, pspPayload: $pspPayload) {
      isDefault
      status
      brand
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
  await resetCustomers(pgDatabase())
  const signInResult = await signIn(options)
  return { ...signInResult }
}

test('addPaymentSource: adding a card as anonymous', async (t) => {
  await prepare({ user: Users.Anonymous })
  const source = await createSource({ card: Cards.Visa })
  const result = await addPaymentSource({ sourceId: source.id, pspPayload: '' })
  t.equal(result.errors[0].message, 'Sie müssen sich zuerst einloggen.', 'mutation fails because not logged in')
  t.end()
})

test('addPaymentSource: adding a 3d secure card', async (t) => {
  const { userId } = await prepare({ user: Users.Member })
  const source = await createSource({ card: Cards.Visa3D, userId })
  const result = await addPaymentSource({ sourceId: source.id, pspPayload: { type: 'three_d_secure' } })
  t.equal(result.errors[0].message, 'Es tut uns leid, aus technischen Gründen können wir zurzeit kein Monatsabo auf eine Kreditkarte buchen, die 3D secure voraussetzt. Sie können es entweder mit einer anderen Karte versuchen und/oder uns kontaktieren unter: zahlungen@republik.ch. ', 'mutation fails because 3d secure currently not allowed')
  t.end()
})

test('addPaymentSource: adding an expired card', async (t) => {
  const { userId } = await prepare({ user: Users.Member })
  const source = await createSource({ card: Cards.Expired, userId })
  const result = await addPaymentSource({ sourceId: source.id, pspPayload: {} })
  t.equal(result.errors[0].message, 'Your card has expired.', 'mutation fails because card is expired')
  t.end()
})

test('addPaymentSource: adding two cards', async (t) => {
  const { userId } = await prepare({ user: Users.Member })
  const untrustedSource = await createSource({ card: Cards.Untrusted, userId })
  const untrustedResult = await addPaymentSource({ sourceId: untrustedSource.id, pspPayload: {} })
  t.notOk(untrustedResult.errors, 'has no errors, untrusted card accepted')
  t.deepEqual(untrustedResult.data, {
    addPaymentSource: [{
      isDefault: true,
      status: 'CHARGEABLE',
      brand: 'Visa',
      expMonth: parseInt(Cards.Untrusted.exp_month, 10),
      expYear: parseInt(Cards.Untrusted.exp_year, 10)
    }]
  }, 'added first card (untrusted, review), automatically became default card')

  const visaSource = await createSource({ card: Cards.Visa, userId })
  const visaResult = await addPaymentSource({ sourceId: visaSource.id, pspPayload: {} })
  t.notOk(visaResult.errors, 'has no errors, visa card accepted')
  t.equal(visaResult.data.addPaymentSource.length, 2, 'both card sources available now')
  t.deepEqual(visaResult.data, {
    addPaymentSource: [{
      isDefault: true,
      status: 'CHARGEABLE',
      brand: 'Visa',
      expMonth: parseInt(Cards.Visa.exp_month, 10),
      expYear: parseInt(Cards.Visa.exp_year, 10)
    }, {
      isDefault: false,
      status: 'CHARGEABLE',
      brand: 'Visa',
      expMonth: parseInt(Cards.Untrusted.exp_month, 10),
      expYear: parseInt(Cards.Untrusted.exp_year, 10)
    }]
  }, 'default card changed to most recent one')
  t.end()
})

test('addPaymentSource: sign out', async (t) => {
  await connectIfNeeded()
  t.ok(await signOut())
  t.end()
})
