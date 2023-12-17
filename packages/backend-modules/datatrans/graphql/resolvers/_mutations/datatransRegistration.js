const { registrationTransaction } = require('../../../lib/helpers')

module.exports = async (_, args, context) => {
  const { method, companyId } = args
  const { pgdb, user: me } = context

  const company = await pgdb.public.companies.findOne({ id: companyId })
  if (!company) {
    throw new Error('company not found')
  }

  const tx = await pgdb.transactionBegin()

  try {
    const paymentSource = await tx.public.paymentSources.insertAndGet({
      method,
      userId: me.id,
      companyId: company.id,
    })

    const { transactionId, registrationUrl } = await registrationTransaction({
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
    throw e
  }
}
