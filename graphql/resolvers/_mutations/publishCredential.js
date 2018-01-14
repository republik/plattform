const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const { MAX_CREDENTIAL_LENGTH } = require('./discussion/lib/Credential')
const ensureStringLength = require('../../../lib/ensureStringLength')

module.exports = async (_, args, { pgdb, req, user: me, t }) => {
  ensureSignedIn(req)

  const {
    description
  } = args

  ensureStringLength(description, {
    max: MAX_CREDENTIAL_LENGTH,
    min: 1,
    error: t('profile/generic/notInRange', {
      key: t('profile/credential/label'),
      min: 1,
      max: MAX_CREDENTIAL_LENGTH
    })
  })

  const transaction = await pgdb.transactionBegin()
  try {
    const existingCredential = await transaction.public.credentials.findOne({
      userId: me.id,
      description
    })
    let newCredential
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
    await transaction.transactionCommit()
    return newCredential
  } catch (e) {
    console.error('publishCredential', e)
    await transaction.transactionRollback()
    throw new Error(t('api/unexpected'))
  }
}
