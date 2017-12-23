const {
  ensureSignedIn, checkUsername, transformUser
} = require('@orbiting/backend-modules-auth')
const { getKeyId } = require('../../../lib/pgp')

module.exports = async (_, args, { pgdb, req, user: me, t }) => {
  ensureSignedIn(req)

  const {
    username,
    address,
    pgpPublicKey
  } = args

  const updateFields = [
    'username',
    'firstName',
    'lastName',
    'birthday',
    'ageAccessRole',
    'phoneNumber',
    'phoneNumberNote',
    'phoneNumberAccessRole',
    'facebookId',
    'twitterHandle',
    'publicUrl',
    'emailAccessRole',
    'pgpPublicKey',
    'hasPublicProfile',
    'biography'
  ]

  if (username !== undefined) {
    await checkUsername(username, me, pgdb)
  }
  if (pgpPublicKey) {
    if (!getKeyId(pgpPublicKey)) {
      throw new Error(t('api/pgpPublicKey/invalid'))
    }
  }

  const transaction = await pgdb.transactionBegin()
  try {
    if (
      updateFields.some(field => args[field] !== undefined)
    ) {
      await transaction.public.users.updateOne(
        { id: me.id },
        updateFields.reduce(
          (updates, key) => {
            updates[key] = args[key]
            return updates
          },
          {}
        ),
        { skipUndefined: true }
      )
    }
    if (address) {
      if (me._raw.addressId) {
        // update address of user
        await transaction.public.addresses.update(
          { id: me._raw.addressId },
          address
        )
      } else {
        // user has no address yet
        const userAddress = await transaction.public.addresses.insertAndGet(
          address
        )
        await transaction.public.users.updateOne(
          { id: me.id },
          { addressId: userAddress.id }
        )
      }
    }
    await transaction.transactionCommit()
    const updatedUser = await pgdb.public.users.findOne({ id: me.id })
    return transformUser(updatedUser)
  } catch (e) {
    console.error('updateMe', e)
    await transaction.transactionRollback()
    throw new Error(t('api/unexpected'))
  }
}
