const { ensureSignedIn } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, { pgdb, req, t }) => {
  ensureSignedIn(req)
  const {
    firstName,
    lastName,
    birthday,
    address,
    phoneNumber,
    facebookId,
    twitterHandle,
    publicUrl,
    isEmailPublic,
    isPrivate
  } = args
  const transaction = await pgdb.transactionBegin()
  try {
    if (
      firstName ||
      lastName ||
      birthday ||
      phoneNumber ||
      facebookId ||
      twitterHandle ||
      publicUrl ||
      isEmailPublic ||
      isPrivate
    ) {
      await transaction.public.users.update(
        { id: req.user.id },
        {
          firstName,
          lastName,
          birthday,
          phoneNumber,
          facebookId,
          twitterHandle,
          publicUrl,
          isEmailPublic,
          isPrivate
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
        await transaction.public.users.update(
          { id: req.user.id },
          { addressId: userAddress.id }
        )
      }
    }
    await transaction.transactionCommit()
    return pgdb.public.users.findOne({ id: req.user.id })
  } catch (e) {
    await transaction.transactionRollback()
    throw new Error(t('api/unexpected'))
  }
}
