const ensureSignedIn = require('../../../lib/ensureSignedIn')
const Consents = require('../../../lib/Consents')

module.exports = async (_, { name }, context) => {
  const { req, user: me } = context
  ensureSignedIn(req)

  await Consents.revokeConsent(
    {
      userId: me.id,
      consent: name,
    },
    context,
  )

  return me
}
