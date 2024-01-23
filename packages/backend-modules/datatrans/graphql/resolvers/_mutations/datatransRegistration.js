const { registrationTransaction, getMerchant } = require('../../../lib/helpers')

module.exports = async (_, args, context) => {
  const { method, companyId } = args
  const { pgdb, user: me, req, t } = context

  const tx = await pgdb.transactionBegin()

  try {
    const company = await pgdb.public.companies.findOne({ id: companyId })
    if (!company) {
      throw new Error('company not found')
    }

    const paymentSource = await tx.public.paymentSources.insertAndGet({
      method,
      userId: me.id,
      companyId: company.id,
    })

    const { transactionId, registrationUrl } = await registrationTransaction({
      merchant: getMerchant(company.id),
      method,
      paymentSourceId: paymentSource.id,
    })

    await tx.public.paymentSources.updateOne(
      { id: paymentSource.id },
      {
        pspPayload: {
          transactionId,
        },
      },
    )

    await tx.transactionCommit()

    return { registrationUrl }
  } catch (e) {
    await tx.transactionRollback()
    console.info('transaction rollback', { req: req._log(), args, error: e })
    throw new Error(t('api/unexpected'))
  }
}
