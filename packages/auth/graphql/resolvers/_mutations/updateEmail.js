const validator = require('validator')
const Roles = require('../../../lib/Roles')
const ensureSignedIn = require('../../../lib/ensureSignedIn')
const {
  updateUserEmail,
  resolveUser,
  EmailInvalidError,
  EmailAlreadyAssignedError,
  UserNotFoundError
} = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, user: me, req }) => {
  ensureSignedIn(req)

  const {
    userId: foreignUserId,
    email
  } = args

  if (!validator.isEmail(email)) {
    throw new EmailInvalidError({ email })
  }
  if (await pgdb.public.users.findFirst({ email })) {
    throw new EmailAlreadyAssignedError({ email })
  }

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
    userId: user.id,
    oldEmail: user.email,
    newEmail: email
  })
}
