const {
  Roles: { ensureUserHasRole },
} = require('@orbiting/backend-modules-auth')

module.exports = async (_, { id }, context) => {
  const { user, loaders, pgdb, t } = context
  ensureUserHasRole(user, 'editor')

  const tx = await pgdb.transactionBegin()
  try {
    const derivative = await loaders.Derivative.byId.load(id)

    if (!derivative) {
      throw new Error(t('api/publikator/destroyDerivative/error/404'))
    }

    const destoryedDerivative = await tx.publikator.derivatives.updateAndGetOne(
      { id },
      {
        updatedAt: new Date(),
        destoroyedAt: new Date(),
      },
    )

    await tx.transactionCommit()

    return destoryedDerivative
  } catch (e) {
    await tx.transactionRollback()
    throw e
  }
}
