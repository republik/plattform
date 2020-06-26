const { Roles } = require('@orbiting/backend-modules-auth')
const { autoPayIsMutable: autoPayIsMutableResolver } = require('../Membership')
const createCache = require('../../../lib/cache')

module.exports = async (_, { id, autoPay }, context) => {
  const { pgdb, req } = context
  Roles.ensureUserHasRole(req.user, 'supporter')

  const transaction = await pgdb.transactionBegin()

  try {
    const membership = await pgdb.public.memberships.findOne({
      id: id
    })
    const autoPayIsMutable = await autoPayIsMutableResolver(membership, null, context)

    if (!autoPayIsMutable) {
      throw new Error(
        `The autoPay field of the membership ${membership.id} is not mutable.`
      )
    }

    if (membership.autoPay === autoPay) {
      return membership
    }

    await pgdb.public.memberships.updateOne({
      id
    }, {
      autoPay
    })

    membership.autoPay = autoPay

    await transaction.transactionCommit()

    await createCache({
      prefix: `User:${membership.userId}`
    }, context).invalidate()

    return membership
  } catch (e) {
    await transaction.transactionRollback()
    console.error('setMembershipAutoPay', e, { req: req._log() })
    throw e
  }
}
