const {
  getUserByAccessToken,
} = require('@orbiting/backend-modules-auth/lib/AccessToken')
const {
  authorizeTransaction,
  getMerchant,
  formatHridAsRefno,
} = require('../../../lib/helpers')

module.exports = async (_, args, context) => {
  const { pledgeId, sourceId, accessToken } = args
  const { loaders, pgdb, user, t } = context

  const me =
    user ||
    (accessToken ? await getUserByAccessToken(accessToken, context) : null)
  if (!me) {
    throw new Error(t('api/users/404'))
  }

  const pledge = await loaders.Pledge.byId.load(pledgeId)
  if (!pledge) {
    throw new Error(t('api/pledge/404'))
  }

  if (pledge.userId !== me.id) {
    throw new Error(t('api/pledge/notYours'))
  }

  if (pledge.status !== 'DRAFT') {
    throw new Error(t('api/pledge/expectedDraftStatus'))
  }

  const pkg = await pgdb.public.packages.findOne({ id: pledge.packageId })
  if (!pkg) {
    throw new Error(t('api/package/404'))
  }

  const paymentSource = await pgdb.public.paymentSources.findOne({
    id: sourceId,
    userId: me.id,
  })
  if (!paymentSource) {
    throw new Error(`api/payment/paymentSource/404`)
  }

  const tx = await pgdb.transactionBegin()

  try {
    // insert payment
    const payment = await tx.public.payments.insertAndGet({
      type: 'PLEDGE',
      method: paymentSource.method,
      total: pledge.total,
      status: 'WAITING',
    })

    // insert pledgePayment
    await tx.public.pledgePayments.insert({
      pledgeId,
      paymentId: payment.id,
      paymentType: 'PLEDGE',
    })

    const { transactionId } = await authorizeTransaction({
      merchant: getMerchant(pkg.companyId),
      refno: formatHridAsRefno(payment.hrid),
      amount: pledge.total,
      alias: paymentSource.pspPayload,
    })

    await tx.public.payments.updateOne(
      { id: payment.id },
      { pspId: transactionId, pspPayload: args },
    )

    await tx.transactionCommit()
    return { paymentId: payment.id }
  } catch (e) {
    await tx.transactionRollback()
    throw e
  }
}
