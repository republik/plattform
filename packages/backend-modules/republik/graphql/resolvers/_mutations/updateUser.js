const { Roles, transformUser } = require('@orbiting/backend-modules-auth')

const { upsertAddress } = require('../../../lib/address')

const logger = console

module.exports = async (_, args, { pgdb, req, t, mail }) => {
  Roles.ensureUserHasRole(req.user, 'supporter')

  const user = await pgdb.public.users.findOne({ id: args.userId })
  if (!user) {
    logger.error('user not found', { req: req._log() })
    throw new Error(t('api/users/404'))
  }

  const {
    firstName,
    lastName,
    birthday,
    address,
    phoneNumber,
    gender,
    prolitterisId,
  } = args
  const transaction = await pgdb.transactionBegin()
  try {
    if (firstName || lastName || birthday || phoneNumber) {
      await transaction.public.users.update(
        { id: user.id },
        {
          firstName,
          lastName,
          birthday,
          phoneNumber,
          gender,
          prolitterisId,
        },
        { skipUndefined: true },
      )
    }
    if (address) {
      const { id: addressId } = await upsertAddress(
        { ...address, id: user.addressId },
        transaction,
        t,
      )

      if (!user.addressId) {
        // link upserted address to user
        await transaction.public.users.updateOne(
          { id: user.id },
          { addressId, updatedAt: new Date() },
        )
      }
    }
    await transaction.transactionCommit()

    const updatedUser = await pgdb.public.users.findOne({ id: user.id })
    await mail.updateMergeFields({ user: updatedUser })

    return transformUser(updatedUser)
  } catch (e) {
    await transaction.transactionRollback()
    logger.error('error in transaction', { req: req._log(), args, error: e })
    throw new Error(t('api/unexpected'))
  }
}
