const { ensureSignedIn, Consents } = require('../../../lib')

module.exports = async (_, { name }, { user: me, pgdb, req, t }) => {
  ensureSignedIn(req)

  await Consents.revokeConsent({
    userId: me.id,
    consent: name,
    req,
    pgdb,
    t
  })

  return me
}
