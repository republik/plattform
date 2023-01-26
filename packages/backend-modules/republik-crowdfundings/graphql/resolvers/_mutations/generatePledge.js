const { Roles } = require('@orbiting/backend-modules-auth')
const generateMemberships = require('../../../lib/generateMemberships')
const payPledgePaymentslip = require('../../../lib/payments/paymentslip/payPledge')
const {
  publishMonitor,
} = require('@orbiting/backend-modules-republik/lib/slack')

module.exports = async (
  _,
  { userId, userEmail, packageName, total: inputTotal, createdAt, startAt },
  { pgdb, req, t, user: me, mail: { enforceSubscriptions }, redis },
) => {
  Roles.ensureUserHasRole(me, 'supporter')

  const transaction = await pgdb.transactionBegin()
  const now = new Date()
  try {
    const user = await transaction.public.users.findOne(
      {
        id: userId,
        email: userEmail,
      },
      {
        skipUndefined: true,
      },
    )
    if (!user) {
      throw new Error(t('api/users/404'))
    }
    // if (!user.addressId) {
    //   throw new Error(t('api/pledge/generate/missingAddress'))
    // }

    const pkg = await transaction.public.packages.findFirst(
      { name: packageName },
      { orderBy: { createdAt: 'desc' } },
    )
    if (!pkg) {
      throw new Error('Package not found')
    }

    const pkgOption = await transaction.public.packageOptions.findOne({
      packageId: pkg.id,
    })
    const membershipType = await transaction.public.membershipTypes.findOne({
      rewardId: pkgOption.rewardId,
    })
    const total = inputTotal || pkgOption.price
    const payload = {
      generatedAt: now,
      generatedBy: me.id,
    }
    if (createdAt) {
      payload.backdatedTo = createdAt
    }

    const pledge = await transaction.public.pledges.insertAndGet({
      packageId: pkg.id,
      userId: user.id,
      status: 'SUCCESSFUL',
      total: total,
      donation: total - pkgOption.price,
      sendConfirmMail: false,
      createdAt: createdAt || now,
      updatedAt: now,
      payload,
    })

    await transaction.public.pledgeOptions.insert({
      templateId: pkgOption.id,
      pledgeId: pledge.id,
      amount: 1,
      price: total,
      vat: pkgOption.vat,
      periods: membershipType ? membershipType.defaultPeriods : undefined,
      createdAt: createdAt || now,
      updatedAt: now,
    })

    await payPledgePaymentslip({
      pledgeId: pledge.id,
      total,
      userId,
      transaction,
      t,
      createdAt,
    })

    await generateMemberships(pledge.id, transaction, t, redis, {
      startAt,
    })

    await transaction.transactionCommit()

    try {
      await enforceSubscriptions({ pgdb, userId })
    } catch (e2) {
      console.error('newsletter subscription changes failed', {
        req: req._log(),
        error: e2,
      })
    }

    await publishMonitor(
      req.user,
      `generatePledge for *${user.firstName} ${user.lastName} - ${user.email}* pledgeId: ${pledge.id}`,
    )

    return pledge
  } catch (e) {
    console.error('generatePledge', e, { req: req._log() })
    await transaction.transactionRollback()
    throw e
  }
}
