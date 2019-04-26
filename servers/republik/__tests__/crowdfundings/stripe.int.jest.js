const { Instance } = require('@orbiting/backend-modules-test')

Instance.bootstrapEnv()

const moment = require('moment')
const {
  signIn,
  signOut,
  Users
} = require('@orbiting/backend-modules-auth/__tests__/auth')
const {
  Cards,
  createSource,
  resetCustomers,
  invoicePaymentSuccess,
  chargeSuccess,
  chargeRefund,
  invoicePaymentFail,
  cancelSubscription
} = require('./stripeHelpers')
const {
  prepareNewPledge,
  PAYMENT_METHODS,
  payPledge,
  checkSeed
} = require('./helpers')
const seedCrowdfundings = require('../../seeds/seedCrowdfundings')

beforeAll(async () => {
  await Instance.init({ serverName: 'republik' })
  await seedCrowdfundings(global.instance.context.pgdb, true)
  await checkSeed()
}, 60000)

afterAll(async () => {
  await resetCustomers(global.instance.context.pgdb) // delete customers from stripe
  await global.instance.closeAndCleanup()
}, 60000)

beforeEach(async () => {
  const { pgdb } = global.instance.context

  await resetCustomers(pgdb) // delete customers from stripe

  await pgdb.public.users.truncate({ cascade: true })
  await pgdb.public.sessions.truncate({ cascade: true })
  await pgdb.public.payments.truncate({ cascade: true })
  await pgdb.public.pledgePayments.truncate({ cascade: true })
  await pgdb.public.pledges.truncate({ cascade: true })

  global.instance.apolloFetch = global.instance.createApolloFetch()
})

// syntax "helpers"
const pgDatabase = () =>
  global.instance.context.pgdb
const i18n = (arg) =>
  global.instance.context.t(arg)

describe('addPaymentSource', () => {
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

  test('adding a card as anonymous', async () => {
    await signIn({ user: Users.Anonymous })
    const source = await createSource({ card: Cards.Visa })
    const result = await addPaymentSource({ sourceId: source.id, pspPayload: '' })
    expect(result.errors[0].message).toBe(i18n('api/signIn'))
    await signOut()
  })

  test('adding a 3d secure card', async () => {
    const { userId } = await signIn({ user: Users.Member })
    const source = await createSource({ card: Cards.Visa3D, userId })
    const result = await addPaymentSource({ sourceId: source.id, pspPayload: { type: 'three_d_secure' } })
    expect(result.errors[0].message).toBe(i18n('api/payment/subscription/threeDsecure/notSupported'))
    await signOut()
  })

  test('adding an expired card', async () => {
    const { userId } = await signIn({ user: Users.Member })
    const source = await createSource({ card: Cards.Expired, userId })
    const result = await addPaymentSource({ sourceId: source.id, pspPayload: {} })
    expect(result.errors[0].message).toBe('Your card has expired.')
    await signOut()
  })

  test('adding two cards', async () => {
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
  })
})

describe('payPledge', () => {
  test('ABO pledge with PAYMENTSLIP (post-payment)', async () => {
    const { pledgeId } = await prepareNewPledge()
    const result = await payPledge({
      pledgeId,
      method: PAYMENT_METHODS.PAYMENTSLIP,
      paperInvoice: true
    })
    expect(result.errors).toBeFalsy()
    const pledgePayment = await pgDatabase().public.pledgePayments.findOne({ pledgeId })
    const payment = await pgDatabase().public.payments.findOne({ id: pledgePayment.paymentId })
    expect(payment.status).toBe('WAITING')
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

  test('ABO pledge with STRIPE', async () => {
    const { pledgeId } = await prepareNewPledge()
    const source = await createSource({ card: Cards.Visa, pledgeId })
    const result = await payPledge({
      pledgeId,
      method: PAYMENT_METHODS.STRIPE,
      sourceId: source.id
    })
    expect(result.errors).toBeFalsy()
    const pledgePayment = await pgDatabase().public.pledgePayments.findOne({ pledgeId })
    const payment = await pgDatabase().public.payments.findOne({ id: pledgePayment.paymentId })
    expect(payment.status).toBe('PAID')

    const membership = await pgDatabase().public.memberships.findOne({ pledgeId })
    expect(membership.active).toBe(true)
    expect(membership.voucherable).toBe(false)

    const periods = await pgDatabase().public.membershipPeriods.find({ membershipId: membership.id })
    expect(periods.length === 1).toBeTruthy()
    expect(moment().add('360', 'days').isBefore(moment(periods[0].endDate))).toBeTruthy()
    expect(moment().add('1', 'year').isAfter(moment(periods[0].endDate))).toBeTruthy()
  })

  test('MONTHLY_ABO pledge with STRIPE and then refund', async () => {
    const { pledgeId } = await prepareNewPledge({ templateId: '00000000-0000-0000-0008-000000000002' })
    const source = await createSource({ card: Cards.Visa, pledgeId })
    const result = await payPledge({
      pledgeId,
      method: PAYMENT_METHODS.STRIPE,
      sourceId: source.id
    })
    expect(result.errors).toBeFalsy()

    const pledgePaymentBeforeCharge = await pgDatabase().public.pledgePayments.findOne({ pledgeId })
    expect(pledgePaymentBeforeCharge).toBeFalsy()

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
    expect(payment.status).toBe('PAID')

    const membership = await pgDatabase().public.memberships.findOne({ pledgeId })
    expect(membership.active).toBe(true)
    expect(membership.voucherable).toBe(false)

    const periods = await pgDatabase().public.membershipPeriods.find({ membershipId: membership.id })
    expect(periods.length === 1).toBeTruthy()
    expect(moment().add('23', 'hours').isBefore(moment(periods[0].endDate))).toBeTruthy()
    expect(moment().add('1', 'day').isAfter(moment(periods[0].endDate))).toBeTruthy()

    await chargeRefund({ chargeId: 'TEST' }, pgDatabase())
    const { status } = await pgDatabase().public.payments.findFirst({ id: payment.id })
    expect(status).toBe('REFUNDED')
  })

  test('Membership that never got charged successfully on MONTHLY_ABO pledge with STRIPE', async () => {
    const { pledgeId } = await prepareNewPledge({ templateId: '00000000-0000-0000-0008-000000000002' })
    const source = await createSource({ card: Cards.Untrusted, pledgeId })
    const result = await payPledge({
      pledgeId,
      method: PAYMENT_METHODS.STRIPE,
      sourceId: source.id
    })
    expect(result.errors).toBeFalsy()

    // simulate failed payment of the pledge
    await invoicePaymentFail({
      pledgeId
    }, pgDatabase())

    const pledgePayment = await pgDatabase().public.pledgePayments.findOne({ pledgeId })
    expect(pledgePayment).toBeFalsy()

    const membership = await pgDatabase().public.memberships.findOne({ pledgeId })
    expect(membership.latestPaymentFailedAt).toBeTruthy()
    expect(membership.active).toBe(true)
    expect(membership.voucherable).toBe(false)

    const periods = await pgDatabase().public.membershipPeriods.find({ membershipId: membership.id })
    expect(periods.length).toBe(1)
  })

  test('Multiple failed payments on MONTHLY_ABO pledge with STRIPE', async () => {
    const { pledgeId } = await prepareNewPledge({ templateId: '00000000-0000-0000-0008-000000000002' })
    await resetCustomers(pgDatabase())
    const source = await createSource({ card: Cards.Visa, pledgeId })
    const result = await payPledge({
      pledgeId,
      method: PAYMENT_METHODS.STRIPE,
      sourceId: source.id
    })
    expect(result.errors).toBeFalsy()

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
    expect(membership.active).toBe(false)

    const periods = await pgDatabase().public.membershipPeriods.find({ membershipId: membership.id })
    expect(periods.length).toBe(1)
  })
})
