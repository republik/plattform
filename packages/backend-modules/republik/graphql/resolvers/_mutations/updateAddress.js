const { Roles } = require('@orbiting/backend-modules-auth')

const { updateAddress } = require('../../../lib/address')

const ALLOWED_ROLES = ['admin', 'supporter']

module.exports = async (_, args, { pgdb, user: me, t }) => {
  const pledges = await pgdb.public.pledges.find({ shippingAddressId: args.id })
  const users = await pgdb.public.users.find({
    or: [
      pledges.length && { id: pledges.map((p) => p.userId) },
      { addressId: args.id },
    ].filter(Boolean),
  })

  if (!users.some((user) => Roles.userIsMeOrInRoles(user, me, ALLOWED_ROLES))) {
    throw new Error(
      t.pluralize('api/unauthorized', {
        count: ALLOWED_ROLES.length,
        role: ALLOWED_ROLES.map((r) => `«${r}»`).join(', '),
      }),
    )
  }

  const tx = await pgdb.transactionBegin()

  try {
    const address = await updateAddress({ ...args.address, id: args.id }, tx, t)

    await tx.transactionCommit()
    return address
  } catch (e) {
    console.error('updateAddress', e)
    await tx.transactionRollback()
    throw new Error(t('api/unexpected'))
  }
}
