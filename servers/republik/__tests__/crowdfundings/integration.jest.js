const { Instance } = require('@orbiting/backend-modules-test')
const seedCrowdfundings = require('../../seeds/seedCrowdfundings')
const moment = require('moment')

const {
  signIn,
  signOut,
  Users
} = require('@orbiting/backend-modules-auth/__tests__/auth')
const {
  prepareNewPledge,
  PAYMENT_METHODS,
  payPledge,
  cancelPledge,
  submitPledge,
  checkSeed
} = require('./helpers')

beforeAll(async () => {
  await Instance.init({ serverName: 'republik' })
  await seedCrowdfundings(global.instance.context.pgdb, true)
  await checkSeed()
}, 60000)

afterAll(async () => {
  await global.instance.closeAndCleanup()
}, 60000)

beforeEach(async () => {
  const { pgdb } = global.instance.context

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

describe('submitPledge', () => {
  test('default pledge with ABO package', async () => {
    const result = await submitPledge({
      'total': 24000,
      'options': [{
        'amount': 1,
        'price': 24000,
        'templateId': '00000000-0000-0000-0008-000000000001'
      }]
    })
    expect(result.errors).toBeFalsy()
    expect(result.data.submitPledge.pledgeId).not.toBe(null)
    expect(result.data.submitPledge.userId).not.toBe(null)
    expect(result.data.submitPledge.pfAliasId).not.toBe(null)
    expect(result.data.submitPledge.emailVerify).toBe(null)
    expect(result.data.submitPledge.pfSHA).toBeTruthy()

    const membership = await pgDatabase().public.memberships.count({ pledgeId: result.data.submitPledge.pledgeId })
    expect(!membership).toBeTruthy()

    const pledge = await pgDatabase().public.pledges.findOne({ id: result.data.submitPledge.pledgeId })
    expect(pledge.total).toBe(24000)

    console.log('submit pledge again with the same e-mail address')
    const result2 = await submitPledge({
      'total': 24000,
      'options': [{
        'amount': 1,
        'price': 24000,
        'templateId': '00000000-0000-0000-0008-000000000001'
      }]
    })
    expect(result2.errors).toBeFalsy()
    expect(result2.data.submitPledge.pledgeId).toBe(null)
    expect(result2.data.submitPledge.userId).toBe(null)
    expect(result2.data.submitPledge.pfAliasId).toBe(null)
    expect(result2.data.submitPledge.emailVerify).toBe(true)
    expect(result2.data.submitPledge.pfSHA).toBe(null)
    const membership2 = await pgDatabase().public.memberships.count({ pledgeId: result2.data.submitPledge.pledgeId })
    expect(!membership2).toBeTruthy()
  })

  test('pledge with ABO package and donation', async () => {
    const result = await submitPledge({
      'total': 40000,
      'options': [{
        'amount': 1,
        'price': 24000,
        'templateId': '00000000-0000-0000-0008-000000000001'
      }]
    })
    expect(result.errors).toBeFalsy()
    expect(result.data.submitPledge.pledgeId).not.toBe(null)
    expect(result.data.submitPledge.pfSHA).toBeTruthy()

    const pledge = await pgDatabase().public.pledges.findOne({ id: result.data.submitPledge.pledgeId })
    expect(pledge.donation).toBe(16000)
    expect(pledge.total).toBe(40000)
  })

  test('pledge with ABO package and userPrice', async () => {
    const result = await submitPledge({
      'total': 10000,
      'options': [{
        'amount': 1,
        'price': 24000,
        'templateId': '00000000-0000-0000-0008-000000000001'
      }],
      reason: 'testing the reason'
    })
    expect(result.errors).toBeFalsy()
    expect(result.data.submitPledge.pledgeId).not.toBe(null)
    expect(result.data.submitPledge.pfSHA).toBeTruthy()

    const pledge = await pgDatabase().public.pledges.findOne({ id: result.data.submitPledge.pledgeId })
    expect(pledge.donation).toBe(-14000)
    expect(pledge.total).toBe(10000)
  })

  test('pledge with userPrice but no reason', async () => {
    pgDatabase().public.pledges.truncate({ cascade: true })
    const result = await submitPledge({
      'total': 10000,
      'options': [{
        'amount': 1,
        'price': 24000,
        'templateId': '00000000-0000-0000-0008-000000000001'
      }]
    })
    expect(result.errors).toBeTruthy()
  })

  test('pledge with ABO package and userPrice too low (minUserPrice = 1000) is not possible', async () => {
    const result = await submitPledge({
      'total': 999,
      'options': [{
        'amount': 1,
        'price': 999,
        'templateId': '00000000-0000-0000-0008-000000000001'
      }]
    })
    expect(result.errors).toBeTruthy()
  })

  test('pledge with 2 x ABO (maxAmount = 1) is not possible', async () => {
    const result = await submitPledge({
      'total': 40000,
      'options': [{
        'amount': 2,
        'price': 24000,
        'templateId': '00000000-0000-0000-0008-000000000001'
      }]
    })
    expect(result.errors).toBeTruthy()
  })

  test('pledge with PATRON and 1 x SWEETS (minAmount = 2) is not possible', async () => {
    const result = await submitPledge({
      'total': 103000,
      'options': [{
        'amount': 1,
        'price': 100000,
        'templateId': '00000000-0000-0000-0008-000000000003'
      }, {
        'amount': 1,
        'price': 3000,
        'templateId': '00000000-0000-0000-0008-000000000004'
      }]
    })
    expect(result.errors).toBeTruthy()
  })

  test('pledge with PATRON package (userPrice = false) and a total that is lower than the price is not possible', async () => {
    const result = await submitPledge({
      'total': 99999,
      'options': [{
        'amount': 1,
        'price': 10000,
        'templateId': '00000000-0000-0000-0008-000000000003'
      }]
    })
    expect(result.errors).toBeTruthy()
  })

  test('pledge with mixed PATRON package options and ABO package option is not possible', async () => {
    const result = await submitPledge({
      'total': 100000,
      'options': [{
        'amount': 1,
        'price': 100000,
        'templateId': '00000000-0000-0000-0008-000000000002'
      }, {
        'amount': 1,
        'price': 20000,
        'templateId': '00000000-0000-0000-0008-000000000001'
      }]
    })
    expect(result.errors).toBeTruthy()
  })
})

describe('updatePayment', () => {
  const UPDATE_PAYMENT_MUTATION = `
    mutation updatePayment($paymentId: ID!, $status: PaymentStatus!, $reason: String) {
      updatePayment(paymentId: $paymentId, status: $status, reason: $reason) {
        status
      }
    }
  `

  const updatePayment = async ({ paymentId, status, reason, apolloFetch = global.instance.apolloFetch }) => {
    return apolloFetch({
      query: UPDATE_PAYMENT_MUTATION,
      variables: {
        paymentId,
        status,
        reason
      }
    })
  }

  const prepareNewPaidPledge = async ({ templateId } = {}) => {
    const result = await prepareNewPledge({ templateId })
    await payPledge({
      pledgeId: result.pledgeId,
      method: PAYMENT_METHODS.PAYMENTSLIP,
      paperInvoice: true
    })
    return result
  }

  test('WAITING -> CANCELLED', async () => {
    const { pledgeId } = await prepareNewPaidPledge()
    await signIn({ user: Users.Supporter })
    const status = 'CANCELLED'
    const { paymentId } = await pgDatabase().public.pledgePayments.findFirst({ pledgeId })
    const result = await updatePayment({
      paymentId,
      status,
      reason: 'WAITING -> CANCELLED'
    })
    expect(result.errors).toBeTruthy()

    await signOut()
  })

  test('WAITING -> WAITING_FOR_REFUND', async () => {
    const { pledgeId } = await prepareNewPaidPledge()
    await signIn({ user: Users.Supporter })
    const status = 'WAITING_FOR_REFUND'
    const { paymentId } = await pgDatabase().public.pledgePayments.findFirst({ pledgeId })
    const result = await updatePayment({
      paymentId,
      status,
      reason: 'WAITING -> WAITING_FOR_REFUND'
    })
    expect(result.errors).toBeTruthy()

    await signOut()
  })

  test('WAITING -> REFUNDED', async () => {
    const { pledgeId } = await prepareNewPaidPledge()
    await signIn({ user: Users.Supporter })
    const status = 'WAITING_FOR_REFUND'
    const { paymentId } = await pgDatabase().public.pledgePayments.findFirst({ pledgeId })
    const result = await updatePayment({
      paymentId,
      status,
      reason: 'WAITING -> REFUNDED'
    })
    expect(result.errors).toBeTruthy()

    await signOut()
  })

  test('WAITING -> PAID', async () => {
    const { pledgeId } = await prepareNewPaidPledge()
    await signIn({ user: Users.Supporter })
    const status = 'PAID'
    const { paymentId } = await pgDatabase().public.pledgePayments.findFirst({ pledgeId })
    const result = await updatePayment({
      paymentId,
      status,
      reason: 'WAITING -> PAID'
    })
    expect(result.errors).toBeFalsy()
    expect(result.data).toEqual({
      updatePayment: { status }
    })

    await signOut()
  })

  test('WAITING_FOR_REFUND -> REFUNDED', async () => {
    const { pledgeId } = await prepareNewPaidPledge()
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
    expect(result.errors).toBeFalsy()
    expect(result.data).toEqual({
      updatePayment: { status: 'REFUNDED' }
    })

    await signOut()
  })
})

describe('claimMembership', () => {
  const CLAIM_MEMBERSHIP = `
    mutation claimMembership($voucherCode: String!) {
      claimMembership(voucherCode: $voucherCode)
    }
  `

  const claimMembership = async ({ voucherCode, apolloFetch = global.instance.apolloFetch }) => {
    return apolloFetch({
      query: CLAIM_MEMBERSHIP,
      variables: {
        voucherCode
      }
    })
  }

  test('Claim a membership with package isAutoActivateUserMembership disabled', async () => {
    const { pledgeId } = await prepareNewPledge({ templateId: '00000000-0000-0000-0008-000000000006' })
    await payPledge({
      pledgeId,
      method: PAYMENT_METHODS.PAYMENTSLIP,
      paperInvoice: true
    })
    const membership = await pgDatabase().public.memberships.findFirst({ pledgeId })
    expect(membership).toBeTruthy()
    const { voucherCode } = membership
    expect(voucherCode).toBeTruthy()

    await signIn({ user: Users.Member })
    const result = await claimMembership({ voucherCode })
    expect(result).toEqual({ data: { claimMembership: true } })
    const membershipAfterClaim = await pgDatabase().public.memberships.findFirst({ pledgeId })
    expect(membershipAfterClaim.userId).toBe(Users.Member.id)
    expect(membershipAfterClaim.voucherable).toBeFalsy()

    await signOut()
  })

  test('Claim a membership with package isAutoActivateUserMembership enabled', async () => {
    // const locks = await pgDatabase().query('SELECT state, count(*) FROM pg_stat_activity GROUP BY state')
    // console.log(locks)

    const { pledgeId } = await prepareNewPledge({ templateId: '00000000-0000-0000-0008-000000000001' })
    await payPledge({
      pledgeId,
      method: PAYMENT_METHODS.PAYMENTSLIP,
      paperInvoice: true
    })
    const membership = await pgDatabase().public.memberships.findFirst({ pledgeId })
    expect(membership).toBeTruthy()
    const { voucherCode } = membership
    expect(voucherCode).toBeFalsy()

    await signIn({ user: Users.Member })
    const result = await claimMembership({ voucherCode: 'TEST' })
    expect(result.errors[0].message).toBeTruthy()
    const membershipAfterClaim = await pgDatabase().public.memberships.findFirst({ pledgeId })
    expect(membershipAfterClaim.userId).not.toBe(Users.Member.id)

    await signOut()
  })
})

describe('reclaimPledge', () => {
  const RECLAIM_PLEDGE_MUTATION = `
    mutation reclaimPledge($pledgeId: ID!) {
      reclaimPledge(pledgeId: $pledgeId)
    }
  `

  const reclaimPledge = ({ pledgeId, apolloFetch = global.instance.apolloFetch }) => {
    return apolloFetch({
      query: RECLAIM_PLEDGE_MUTATION,
      variables: {
        pledgeId
      }
    })
  }

  test('Claim a pledge of a unverified user as nobody', async () => {
    const { pledgeId } = await prepareNewPledge()
    const result = await reclaimPledge({
      pledgeId
    })
    expect(result.errors).toBeTruthy()
  })

  test('Claim a pledge of a unverified user as verified user', async () => {
    const { pledgeId } = await prepareNewPledge({ user: Users.Unverified })
    await signIn({ user: Users.Member })
    const result = await reclaimPledge({
      pledgeId
    })
    expect(result.data.reclaimPledge).toBeTruthy()
    const pledge = await pgDatabase().public.pledges.findOne({ id: pledgeId })
    expect(pledge.userId).toBe(Users.Member.id)
    await signOut()
  })

  test('Claim a pledge of a verified user', async () => {
    const { pledgeId, apolloFetch } = await prepareNewPledge({ user: Users.Member })
    await signIn({ user: Users.Member, apolloFetch }) // verify

    await signIn({ user: Users.Unverified })
    const result = await reclaimPledge({
      pledgeId
    })
    expect(result.errors).toBeTruthy()
    await signOut()
  })
})

describe('cancelPledge', () => {
  test('Unpaid (DRAFT) ABO with PAYMENTSLIP', async () => {
    const { pledgeId } = await prepareNewPledge()
    await signIn({ user: Users.Supporter })
    const result = await cancelPledge({
      pledgeId
    })
    expect(result.errors).toBeFalsy()
    expect(result.data).toEqual({cancelPledge: null})
    // check that payment is CANCELLED as well!
    const pledgePayment = await pgDatabase().public.pledgePayments.findOne({ pledgeId })
    expect(pledgePayment).toBeFalsy()

    const membership = await pgDatabase().public.memberships.findOne({ pledgeId })
    expect(membership).toBeFalsy()

    await signOut()
  })

  test('Waiting ABO with PAYMENTSLIP', async () => {
    const { pledgeId } = await prepareNewPledge()
    await payPledge({
      pledgeId,
      method: PAYMENT_METHODS.PAYMENTSLIP,
      paperInvoice: true
    })
    const membership = await pgDatabase().public.memberships.findOne({ pledgeId })
    expect(membership).toBeTruthy()
    await signIn({ user: Users.Supporter })
    const result = await cancelPledge({
      pledgeId
    })
    expect(result.errors).toBeFalsy()
    expect(result.data).toBeTruthy()
    expect(result.data.cancelPledge.memberships.length).toBe(1)
    expect(result.data.cancelPledge.memberships[0].periods.length).toBe(1)
    const afterEndDate = moment().add(30, 'seconds')
    expect(
      moment(result.data.cancelPledge.memberships[0].periods[0].endDate).isBefore(afterEndDate)
    ).toBeTruthy()

    const pledgePayment = await pgDatabase().public.pledgePayments.findOne({ pledgeId })
    expect(pledgePayment).toBeTruthy()

    const payment = await pgDatabase().public.payments.findOne({ id: pledgePayment.paymentId })
    expect(payment).toBeTruthy()
    expect(payment.status).toBe('CANCELLED')

    await signOut()
  })
})
