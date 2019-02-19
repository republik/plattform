const { ensureSignedIn, Consents } = require('../../../lib')

module.exports = async (_, { name }, { user: me, pgdb, req, t }) => {
  ensureSignedIn(req)

  await Consents.saveConsents({
    userId: me.id,
    consents: [name],
    req,
    pgdb
  })

  return me
}
