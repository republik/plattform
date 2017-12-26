const { Roles } = require('@orbiting/backend-modules-auth')
const logger = console
const {ascending} = require('d3-array')
const updateUserOnMailchimp = require('../../../lib/updateUserOnMailchimp')
const unsubscribeFromMailchimp = require('../../../lib/unsubscribeFromMailchimp')

module.exports = async (_, args, {pgdb, req, t}) => {
  Roles.ensureUserHasRole(req.user, 'admin')

  const {targetUserId, sourceUserId} = args

  const now = new Date()
  const transaction = await pgdb.transactionBegin()
  try {
    const targetUser = await transaction.public.users.findOne({id: targetUserId})
    if (!targetUser) {
      logger.error('target user not found', { req: req._log(), targetUserId })
      throw new Error(t('api/users/404'))
    }
    const sourceUser = await transaction.public.users.findOne({id: sourceUserId})
    if (!sourceUser) {
      logger.error('source user not found', { req: req._log(), sourceUserId })
      throw new Error(t('api/users/404'))
    }

    if (targetUser.id === sourceUser.id) {
      logger.error('source- and target-user must not be the same', { req: req._log(), sourceUser, targetUser })
      throw new Error(t('api/users/merge/sourceAndTargetIdentical'))
    }

    const users = [targetUser, sourceUser]

    const newUser = await transaction.public.users.updateAndGetOne({
      id: targetUser.id
    }, {
      firstName: users.map(u => u.firstName).filter(Boolean)[0],
      lastName: users.map(u => u.lastName).filter(Boolean)[0],
      birthday: users.map(u => u.birthday).filter(Boolean)[0],
      phoneNumber: users.map(u => u.phoneNumber).filter(Boolean)[0],
      addressId: users.map(u => u.addressId).filter(Boolean)[0],
      createdAt: users.map(u => u.createdAt).sort((a, b) => ascending(a.createdAt, b.createdAt))[0],
      updatedAt: now
    })

    // transfer belongings
    const from = { userId: sourceUser.id }
    const to = { userId: targetUser.id }
    await transaction.public.paymentSources.update(from, to)
    await transaction.public.pledges.update(from, to)
    await transaction.public.memberships.update(from, to)
    await transaction.public.comments.update(from, to)
    if (!(await transaction.public.testimonials.findFirst(to))) {
      await transaction.public.testimonials.update(from, to)
    }
    if (!await (transaction.public.ballots.findFirst(to))) {
      await transaction.public.ballots.update(from, to)
    }

    let sessions = await transaction.public.sessions.find({'sess @>': {passport: {user: sourceUser.id}}})
    for (let session of sessions) {
      const sess = Object.assign({}, session.sess, {
        passport: {user: targetUser.id}
      })
      await transaction.public.sessions.updateOne({sid: session.sid}, {sess})
    }

    // remove addresses
    const addressIds = users
      .filter(u => u.addressId && u.addressId !== newUser.addressId)
      .map(u => u.addressId)
    if (addressIds.length) {
      await transaction.public.addresses.deleteOne({id: addressIds[0]})
    }

    // remove old user
    await transaction.public.users.deleteOne({id: sourceUser.id})

    await transaction.transactionCommit()

    try {
      unsubscribeFromMailchimp({
        email: sourceUser.email
      })
      updateUserOnMailchimp({
        userId: targetUserId,
        pgdb
      })
    } catch (_e) {
      logger.error('updateMailchimp failed in mergeUsers!', _e)
    }
  } catch (e) {
    await transaction.transactionRollback()
    logger.info('transaction rollback', { req: req._log(), args, error: e })
    throw e
  }

  return pgdb.public.users.findOne({id: targetUserId})
}
