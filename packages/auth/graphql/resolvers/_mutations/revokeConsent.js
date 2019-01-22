const { ensureSignedIn, Consents } = require('../../../lib')

module.exports = async (_, { name }, context) => {
  const { req, user: me, t } = context
  ensureSignedIn(req)

  if (!Consents.REVOKABLE_POLICIES.includes(name)) {
    throw new Error(t('api/consents/notRevokable', { consent: name }))
  }
  await Consents.revokeConsent(
    {
      userId: me.id,
      consent: name
    },
    context
  )

  return me
}
