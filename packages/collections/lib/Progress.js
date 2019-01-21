const { Consents } = require('@orbiting/backend-modules-auth')

const COLLECTION_NAME = 'progress'
const POLICY_NAME = COLLECTION_NAME.toUpperCase()

const enable = (userId, { req, pgdb }) =>
  Consents.saveConsents({
    userId,
    consents: [POLICY_NAME],
    req,
    pgdb
  })

const disable = (userId, { req, pgdb }) =>
  Consents.revokeConsent({
    userId,
    consent: POLICY_NAME,
    req,
    pgdb
  })

const status = (userId, { pgdb }) =>
  Consents.lastRecordForPolicyByUser({
    userId,
    policy: POLICY_NAME,
    pgdb
  })
    .then(record => record && record.record === 'GRANT')

module.exports = {
  COLLECTION_NAME,
  POLICY_NAME,
  enable,
  disable,
  status
}
