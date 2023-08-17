const ensureSignedIn = require('../../../lib/ensureSignedIn')
const Consents = require('../../../lib/Consents')

module.exports = async (_, { name }, { user: me, pgdb, req, t }) => {
  ensureSignedIn(req)

  if (!Consents.VALID_POLICIES.includes(name)) {
    throw new Error(t('api/consents/notValid', { consent: name }))
  }

  await Consents.saveConsents({
    userId: me.id,
    consents: [name],
    req,
    pgdb,
  })

  return me
}
