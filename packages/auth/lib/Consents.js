const { newAuthError } = require('./AuthError')
const MissingConsentsError = newAuthError('missing-consents', 'api/consents/missing')

/*
const POLICIES = [
  'PRIVACY',
  'TOS',
  'STATUTE',
  'NEWSLETTER_PROJECTR',
  'NEWSLETTER_DAILY',
  'NEWSLETTER_WEEKLY'
]
*/

const getAllConsentRecords = ({ userId, pgdb }) =>
  pgdb.public.consents.find(
    {
      userId
    }, {
      orderBy: ['createdAt asc']
    }
  )

// only returns GRANTed consents
const consentsOfUser = async ({ userId, pgdb }) => {
  const consents = await getAllConsentRecords({ userId, pgdb })

  let grantedPolicies = {}
  for (let consent of consents) {
    if (consent.record === 'GRANT') {
      grantedPolicies[consent.policy] = true
    } else {
      delete grantedPolicies[consent.policy]
    }
  }

  return Object.keys(grantedPolicies)
}

// returns the latest record of all policies
const lastRecordForPolicyByUser = async ({ userId, policy, pgdb }) =>
  pgdb.public.consents.find(
    {
      userId,
      policy
    }, {
      orderBy: ['createdAt desc']
    }
  )
    .then(records => records && records[0])

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

const revokeConsent = async ({ userId, consent, req, pgdb }) => {
  await pgdb.public.consents.insert({
    userId,
    policy: consent,
    ip: req.ip,
    record: 'REVOKE'
  })
}

module.exports = {
  lastRecordForPolicyByUser,
  requiredConsents,
  missingConsents,
  ensureAllRequiredConsents,
  saveConsents,
  revokeConsent
}
