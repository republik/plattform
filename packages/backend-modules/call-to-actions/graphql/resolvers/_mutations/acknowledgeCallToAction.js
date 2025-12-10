const { ensureSignedIn } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, context) => {
  const { id, response } = args
  const { req, pgdb, redis, t, user: me } = context

  ensureSignedIn(req)

  const tx = await pgdb.transactionBegin()

  try {
    const cta = await tx.public.callToActions.findOne({ id })

    if (!cta) {
      throw new Error(t('api/call-to-actions/acknowledge/404'))
    }

    if (cta.userId !== me.id) {
      throw new Error(t('api/call-to-actions/acknowledge/notAllowed'))
    }

    if (cta.acknowledgedAt) {
      await tx.transactionRollback()
      return cta
    }

    const updatedCta = await tx.public.callToActions.updateAndGetOne(
      { id },
      { response, acknowledgedAt: new Date() },
    )

    await tx.transactionCommit()

    await redis
      .delAsync(`crowdfundings:cache:User:${cta.userId}:callToActions`)
      .catch(() => null)

    return updatedCta
  } catch (err) {
    await tx.transactionRollback()
    throw err
  }
}
