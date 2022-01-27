const ensureSignedIn = require('../../../lib/ensureSignedIn')
const {
  Type,
  getNotification,
} = require('../../../lib/challenges/AppChallenge')

module.exports = async (_, args, { pgdb, user: me, req }) => {
  ensureSignedIn(req)

  const token = await pgdb.public.tokens.findFirst(
    {
      email: me.email,
      type: Type,
      'expiresAt >= ': new Date(),
    },
    {
      orderBy: ['createdAt desc'],
    },
  )

  if (!token) {
    return
  }

  const notification = getNotification({
    email: me.email,
    token,
  })

  return {
    ...notification,
    verificationUrl: notification.url,
  }
}
