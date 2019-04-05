const { Instance } = require('@orbiting/backend-modules-test')

Instance.bootstrapEnv()

const { signIn, signOut, Users } = require('@orbiting/backend-modules-auth/__tests__/auth')
const {
  Cards,
  createSource,
  resetCustomers
} = require('./stripeHelpers')
const seedCrowdfundings = require('../../seeds/seedCrowdfundings')

beforeAll(async () => {
  await Instance.init({ serverName: 'republik' })
  await seedCrowdfundings(global.instance.context.pgdb, true)
}, 60000)

afterAll(async () => {
  await global.instance.closeAndCleanup()
}, 35000)

beforeEach(async () => {
  const { pgdb } = global.instance.context
  await resetCustomers(pgdb)
  await pgdb.public.users.truncate({ cascade: true })
  await pgdb.public.sessions.truncate({ cascade: true })
  global.instance.apolloFetch = global.instance.createApolloFetch()
})

// syntax "helpers"
const pgDatabase = () =>
  global.instance.context.pgdb
const i18n = (arg) =>
  global.instance.context.t(arg)

const ADD_PAYMENT_SOURCE_MUTATION = `
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

const addPaymentSource = ({ sourceId, pspPayload, apolloFetch = global.instance.apolloFetch }) => {
  return apolloFetch({
    query: ADD_PAYMENT_SOURCE_MUTATION,
    variables: {
      sourceId,
      pspPayload
    }
  })
}

test('addPaymentSource: adding a card as anonymous', async () => {
  await signIn({ user: Users.Anonymous })
  const source = await createSource({ card: Cards.Visa })
  const result = await addPaymentSource({ sourceId: source.id, pspPayload: '' })
  expect(result.errors[0].message).toBe(i18n('api/signIn'))
  await signOut()
}, 15000)

test('addPaymentSource: adding a 3d secure card', async () => {
  const { userId } = await signIn({ user: Users.Member })
  const source = await createSource({ card: Cards.Visa3D, userId })
  const result = await addPaymentSource({ sourceId: source.id, pspPayload: { type: 'three_d_secure' } })
  expect(result.errors[0].message).toBe(i18n('api/payment/subscription/threeDsecure/notSupported'))
  await signOut()
}, 15000)

test('addPaymentSource: adding an expired card', async () => {
  const { userId } = await signIn({ user: Users.Member })
  const source = await createSource({ card: Cards.Expired, userId })
  const result = await addPaymentSource({ sourceId: source.id, pspPayload: {} })
  expect(result.errors[0].message).toBe('Your card has expired.')
  await signOut()
}, 15000)

test('addPaymentSource: adding two cards', async () => {
  const { userId } = await signIn({ user: Users.Member })
  const untrustedSource = await createSource({ card: Cards.Untrusted, userId })
  const untrustedResult = await addPaymentSource({ sourceId: untrustedSource.id, pspPayload: {} })
  expect(untrustedResult.errors).toBeFalsy()
  expect(untrustedResult.data).toEqual({
    addPaymentSource: [{
      isDefault: true,
      status: 'CHARGEABLE',
      brand: 'Visa',
      expMonth: parseInt(Cards.Untrusted.exp_month, 10),
      expYear: parseInt(Cards.Untrusted.exp_year, 10)
    }]
  })

  const visaSource = await createSource({ card: Cards.Visa, userId })
  const visaResult = await addPaymentSource({ sourceId: visaSource.id, pspPayload: {} })
  expect(visaResult.errors).toBeFalsy()
  expect(visaResult.data.addPaymentSource.length).toBe(2)
  expect(visaResult.data).toEqual({
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
  })

  const paymentSources = await pgDatabase().public.paymentSources.find({ userId })
  expect(paymentSources.length).toBe(0)

  await signOut()
}, 15000)
