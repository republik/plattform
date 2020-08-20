const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const { MAX_CREDENTIAL_LENGTH } = require('@orbiting/backend-modules-discussions/lib/Credential')
const { ensureStringLength } = require('@orbiting/backend-modules-utils')
const { isInCandidacy } = require('../../../lib/profile')

module.exports = async (_, args, { pgdb, req, user: me, t }) => {
  ensureSignedIn(req)

  const {
    description
  } = args

  if (
    await isInCandidacy(me._raw, pgdb) &&
    (!description || description.length < 1)
  ) {
    throw new Error(t('profile/candidacy/credential/needed'))
  }

  ensureStringLength(description, {
    max: MAX_CREDENTIAL_LENGTH,
    error: t('profile/generic/tooLong', {
      key: t('profile/credential/label'),
      max: MAX_CREDENTIAL_LENGTH
    })
  })

  const transaction = await pgdb.transactionBegin()
  try {
    await transaction.public.credentials.update({
      userId: me.id
    }, {
      isListed: false,
      updatedAt: new Date()
    })
    let newCredential = null
    if (description) {
      const existingCredential = await transaction.public.credentials.findOne({
        userId: me.id,
        description
      })
      if (existingCredential) {
        newCredential = await transaction.public.credentials.updateAndGetOne({
          id: existingCredential.id
        }, {
          isListed: true,
          updatedAt: new Date()
        })
      } else {
        newCredential = await transaction.public.credentials.insertAndGet({
          userId: me.id,
          description,
          isListed: true
        })
      }
    }
    await transaction.transactionCommit()
    return newCredential
  } catch (e) {
    console.error('publishCredential', e)
    await transaction.transactionRollback()
    throw new Error(t('api/unexpected'))
  }
}
