const { Roles } = require('@orbiting/backend-modules-auth')
const generateMemberships = require('../../../lib/generateMemberships')
const payPledgePaymentslip = require('../../../lib/payments/paymentslip/payPledge')
const { publishMonitor } = require('../../../../../lib/slack')

module.exports = async (_, { userId }, { pgdb, req, t, user: me, mail: { enforceSubscriptions } }) => {
  Roles.ensureUserHasRole(me, 'supporter')

  const transaction = await pgdb.transactionBegin()
  const now = new Date()
  try {
    const user = await transaction.public.users.findOne({ id: userId })
    if (!user) {
      throw new Error(t('api/users/404'))
    }
    if (!user.addressId) {
      throw new Error(t('api/pledge/generate/missingAddress'))
    }

    const pkg = await transaction.public.packages.findFirst(
      { name: 'ABO' },
      { orderBy: { createdAt: 'desc' } }
    )

    const pkgOption = await transaction.public.packageOptions.findOne({
      packageId: pkg.id
    })
    const total = pkgOption.price

    const pledge = await transaction.public.pledges.insertAndGet({
      packageId: pkg.id,
      userId: user.id,
      status: 'SUCCESSFUL',
      total,
      donation: 0,
      sendConfirmMail: false,
      createdAt: now,
      updatedAt: now
    })

    await transaction.public.pledgeOptions.insert({
      templateId: pkgOption.id,
      pledgeId: pledge.id,
      amount: 1,
      price: total,
      vat: pkgOption.vat,
      createdAt: now,
      updatedAt: now
    })

    await payPledgePaymentslip({
      pledgeId: pledge.id,
      total,
      userId,
      transaction,
      t
    })

    await generateMemberships(pledge.id, transaction, t, req)

    const newMembership = await transaction.public.memberships.findOne({
      pledgeId: pledge.id
    })

    await transaction.transactionCommit()

    try {
      await enforceSubscriptions({ pgdb, userId })
    } catch (e2) {
      console.error('newsletter subscription changes failed', { req: req._log(), error: e2 })
    }

    await publishMonitor(
      req.user,
      `generateMembership for *${user.firstName} ${user.lastName} - ${user.email}* pledgeId: ${pledge.id}`
    )

    return newMembership
  } catch (e) {
    console.error('generateMembership', e, { req: req._log() })
    await transaction.transactionRollback()
    throw e
  }
}
