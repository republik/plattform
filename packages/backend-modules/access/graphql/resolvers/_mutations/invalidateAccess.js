const debug = require('debug')('access:mutation:invalidateAccess')

const { ensureSignedIn, Roles } = require('@orbiting/backend-modules-auth')

const { invalidate, noFollowup } = require('../../../lib/grants')

module.exports = async (_, { id }, { req, user, pgdb, t, mail }) => {
  ensureSignedIn(req)

  if (!Roles.userIsInRoles(user, ['admin', 'supporter'])) {
    throw new Error(t('api/access/terminate/role/error'))
  }

  debug('begin', { id, user: user.id })

  const transaction = await pgdb.transactionBegin()

  try {
    const grant = await pgdb.public.accessGrants.findOne({ id })
    if (!grant.invalidatedAt) {
      await invalidate(grant, 'admin', t, transaction, mail, user.id)
    }
    await noFollowup(id, transaction)

    await transaction.transactionCommit()

    debug('commit', { id, user: user.id })

    return true
  } catch (e) {
    await transaction.transactionRollback()

    debug('rollback', { id, user: user.id })

    throw e
  }
}
