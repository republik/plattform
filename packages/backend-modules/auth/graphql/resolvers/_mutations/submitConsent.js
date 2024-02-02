const ensureSignedIn = require('../../../lib/ensureSignedIn')
const Consents = require('../../../lib/Consents')

module.exports = async (_, { name }, { user: me, pgdb, req, t }) => {
  ensureSignedIn(req)

  await Consents.saveConsents({
    userId: me.id,
    consents: [name],
    req,
    pgdb,
    t,
  })

  return me
}
