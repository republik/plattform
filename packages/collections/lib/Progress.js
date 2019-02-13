const { Consents } = require('@orbiting/backend-modules-auth')

const COLLECTION_NAME = 'progress'
const POLICY_NAME = COLLECTION_NAME.toUpperCase()

const status = (userId, { pgdb }) =>
  Consents.lastRecordForPolicyForUser({
    userId,
    policy: POLICY_NAME,
    pgdb
  })
    .then(record => record && record.record === 'GRANT')

module.exports = {
  COLLECTION_NAME,
  POLICY_NAME,
  status
}
