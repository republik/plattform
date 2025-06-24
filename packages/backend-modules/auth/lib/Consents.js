const { newAuthError } = require('./AuthError')
const MissingConsentsError = newAuthError(
  'missing-consents',
  'api/consents/missing',
)

const VALID_POLICIES = [
  'PRIVACY',
  'TOS',
  'STATUTE',
  'PROGRESS_OPT_OUT',
  'PROLITTERIS_OPT_OUT',
  'NEWSLETTER_DAILY',
  'NEWSLETTER_WEEKLY',
  'NEWSLETTER_CLIMATE',
  'NEWSLETTER_ACCOMPLICE',
  'NEWSLETTER_PROJECTR',
  'NEWSLETTER_WDWWW',
]

const REVOKABLE_POLICIES = [
  'PROGRESS_OPT_OUT',
  'PROLITTERIS_OPT_OUT',
  'NEWSLETTER_DAILY',
  'NEWSLETTER_WEEKLY',
  'NEWSLETTER_CLIMATE',
  'NEWSLETTER_ACCOMPLICE',
  'NEWSLETTER_PROJECTR',
  'NEWSLETTER_WDWWW',
]

const getAllConsentRecords = ({ userId, pgdb }) =>
  pgdb.public.consents.find(
    {
      userId,
    },
    {
      orderBy: ['createdAt asc'],
    },
  )

// only returns GRANTed consents
const consentsOfUser = async ({ userId, pgdb }) => {
  const consents = await getAllConsentRecords({ userId, pgdb })

  const grantedPolicies = {}
  for (const consent of consents) {
    if (consent.record === 'GRANT') {
      grantedPolicies[consent.policy] = true
    } else {
      delete grantedPolicies[consent.policy]
    }
  }

  return Object.keys(grantedPolicies)
}

// returns the latest record of all policies
const lastRecordForPolicyForUser = async ({ userId, policy, pgdb }) =>
  pgdb.public.consents.findFirst(
    {
      userId,
      policy,
    },
    {
      orderBy: ['createdAt desc'],
    },
  )

const statusForPolicyForUser = async ({ userId, policy, pgdb }) =>
  lastRecordForPolicyForUser({ userId, policy, pgdb }).then(
    (record) => record && record.record === 'GRANT',
  )

const requiredConsents = async ({ userId, pgdb }) => {

  const { ENFORCE_CONSENTS = '' } = process.env

  if (ENFORCE_CONSENTS) {
    const consented = userId ? await consentsOfUser({ userId, pgdb }) : []
    return ENFORCE_CONSENTS.split(',').filter((consent) => !consented.includes(consent))
  }
  return []
}

const missingConsents = async ({ userId, consents = [], pgdb }) => {
  return requiredConsents({
    pgdb,
    userId,
  }).then((result) =>
    result.filter((consent) => consents.indexOf(consent) === -1),
  )
}

const ensureAllRequiredConsents = async (args) => {
  const _missingConsents = await missingConsents(args)
  if (_missingConsents.length > 0) {
    throw new MissingConsentsError(_missingConsents, {
      consents: _missingConsents.join(', '),
    })
  }
}

const saveConsents = async ({ userId, consents = [], req, pgdb, t }) => {
  if (!consents.every((consent) => VALID_POLICIES.includes(consent))) {
    throw new Error(
      t('api/consents/notValid', { consent: consents.join(', ') }),
    )
  }
  // deduplicate
  const existingConsents = await consentsOfUser({ userId, pgdb })
  const insertConsents = consents.filter(
    (consent) => existingConsents.indexOf(consent) === -1,
  )
 return Promise.all(
    insertConsents.map((consent) =>
      pgdb.public.consents.insert({
        userId,
        policy: consent,
        ip: req.ip,
      }),
    ),
  )
}

const revokeConsent = async ({ userId, consent }, context) => {
  const { req, pgdb, t } = context
  if (!REVOKABLE_POLICIES.includes(consent)) {
    throw new Error(t('api/consents/notRevokable', { consent: consent }))
  }
  await pgdb.public.consents.insert({
    userId,
    policy: consent,
    ip: req.ip,
    record: 'REVOKE',
  })
}

module.exports = {
  REVOKABLE_POLICIES,
  VALID_POLICIES,
  lastRecordForPolicyForUser,
  statusForPolicyForUser,
  requiredConsents,
  missingConsents,
  ensureAllRequiredConsents,
  saveConsents,
  revokeConsent,
}
