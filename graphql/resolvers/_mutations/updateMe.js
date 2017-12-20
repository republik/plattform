const { ensureSignedIn, checkUsername } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, { pgdb, req, user: me, t }) => {
  ensureSignedIn(req)
  const {
    username,
    firstName,
    lastName,
    birthday,
    address,
    phoneNumber,
    facebookId,
    twitterHandle,
    publicUrl,
    isEmailPublic,
    hasPublicProfile
  } = args

  if (username !== undefined) {
    await checkUsername(username, me, pgdb)
  }

  const transaction = await pgdb.transactionBegin()
  try {
    if (
      username ||
      firstName ||
      lastName ||
      birthday ||
      phoneNumber ||
      facebookId ||
      twitterHandle ||
      publicUrl ||
      isEmailPublic ||
      hasPublicProfile
    ) {
      await transaction.public.users.updateOne(
        { id: req.user.id },
        {
          username,
          firstName,
          lastName,
          birthday,
          phoneNumber,
          facebookId,
          twitterHandle,
          publicUrl,
          isEmailPublic,
          hasPublicProfile
        },
        { skipUndefined: true }
      )
    }
    if (address) {
      if (req.user.addressId) {
        // update address of user
        await transaction.public.addresses.update(
          { id: req.user.addressId },
          address
        )
      } else {
        // user has no address yet
        const userAddress = await transaction.public.addresses.insertAndGet(
          address
        )
        await transaction.public.users.updateOne(
          { id: req.user.id },
          { addressId: userAddress.id }
        )
      }
    }
    await transaction.transactionCommit()
    return pgdb.public.users.findOne({ id: req.user.id })
  } catch (e) {
    console.error('updateMe', e)
    await transaction.transactionRollback()
    throw new Error(t('api/unexpected'))
  }
}
