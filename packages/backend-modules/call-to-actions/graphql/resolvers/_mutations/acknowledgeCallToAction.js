const { getCache } = require('../../../lib/cache')

module.exports = async (_, args, context) => {
  const { id, response } = args
  const { pgdb, t, user: me } = context

  const tx = await pgdb.transactionBegin()

  try {
    const cta = await tx.public.callToActions.findOne({ id })

    if (cta.userId !== me.id) {
      throw new Error(t('api/call-to-action/User/callToAction/notAllowed'))
    }

    if (!cta) {
      throw new Error(t('api/call-to-actions/acknowledge/404'))
    }

    if (cta.acknowledgedAt) {
      return cta
    }

    const updatedCta = await tx.public.callToActions.updateAndGetOne(
      { id },
      { response, acknowledgedAt: new Date() },
    )

    await tx.transactionCommit()

    await getCache(cta.userId, context).invalidate()

    return updatedCta
  } catch (err) {
    await tx.transactionRollback()
    throw err
  }
}
