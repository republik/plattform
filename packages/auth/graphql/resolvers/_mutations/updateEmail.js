const Roles = require('../../../lib/Roles')
const ensureSignedIn = require('../../../lib/ensureSignedIn')
const {
  updateUserEmail,
  resolveUser,
  UserNotFoundError
} = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, user: me, req }) => {
  ensureSignedIn(req)

  const {
    userId: foreignUserId,
    email: rawEmail
  } = args

  const email = rawEmail.toLowerCase() // security, only process lower case emails

  const user = await resolveUser({ slug: foreignUserId, pgdb, fallback: me })
  Roles.ensureUserIsMeOrInRoles(user, me, ['supporter', 'admin'])
  if (!user) {
    throw new UserNotFoundError({ foreignUserId })
  }
  if (user.email === email) {
    return user
  }

  return updateUserEmail({
    pgdb,
    user: user,
    email: email
  })
}
