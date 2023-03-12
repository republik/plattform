const { ensureSignedIn } = require('@orbiting/backend-modules-auth')

const { getCache } = require('../../../lib/cache')

module.exports = async (_, args, context) => {
  const { id, response } = args
  const { req, pgdb, t, user: me } = context

  ensureSignedIn(req)

  const tx = await pgdb.transactionBegin()

  try {
    const cta = await tx.public.callToActions.findOne({ id })

    if (cta.userId !== me.id) {
      throw new Error(t('api/call-to-action/acknowledge/notAllowed'))
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

    await getCache(cta.userId, context).invalidate()

    await tx.transactionCommit()

    return updatedCta
  } catch (err) {
    await tx.transactionRollback()
    throw err
  }
}
