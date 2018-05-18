const { newAuthError } = require('./AuthError')
const MissingConsentsError = newAuthError('missing-consents', 'api/consents/missing')

const consentsOfUser = async ({ userId, pgdb }) => {
  return pgdb.public.consents.find({ userId })
    .then(result => result
      .map(consent => consent.policy)
    )
}

const requiredConsents = async ({ userId, pgdb }) => {
  const {
    ENFORCE_CONSENTS = ''
  } = process.env

  if (ENFORCE_CONSENTS) {
    const consented = userId
      ? await consentsOfUser({ userId, pgdb })
      : []

    return ENFORCE_CONSENTS
      .split(',')
      .filter(consent =>
        consented.indexOf(consent) === -1
      )
  }
  return []
}

const missingConsents = async ({ userId, consents = [], pgdb }) => {
  return requiredConsents({
    pgdb,
    userId
  })
    .then(result => result
      .filter(consent => consents.indexOf(consent) === -1)
    )
}

const ensureAllRequiredConsents = async (args) => {
  const _missingConsents = await missingConsents(args)
  if (_missingConsents.length > 0) {
    throw new MissingConsentsError(_missingConsents, {
      consents: _missingConsents.join(', ')
    }
    )
  }
}

const saveConsents = async ({ userId, consents = [], req, pgdb }) => {
  // deduplicate
  const existingConsents = await consentsOfUser({ userId, pgdb })
  const insertConsents = consents
    .filter(consent => existingConsents.indexOf(consent) === -1)
  return Promise.all(
    insertConsents.map(consent =>
      pgdb.public.consents.insert({
        userId,
        policy: consent,
        ip: req.ip
      })
    )
  )
}

module.exports = {
  requiredConsents,
  missingConsents,
  ensureAllRequiredConsents,
  saveConsents
}
