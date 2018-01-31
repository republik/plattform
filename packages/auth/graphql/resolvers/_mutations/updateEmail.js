const isEmail = require('email-validator').validate
const t = require('../../../lib/t')
const Roles = require('../../../lib/Roles')
const ensureSignedIn = require('../../../lib/ensureSignedIn')
const { updateUserEmail, resolveUser } = require('../../../lib/Users')

module.exports = async (_, args, { pgdb, user: me, req }) => {
  ensureSignedIn(req)

  const {
    userId: foreignUserId,
    email
  } = args

  if (!isEmail(email)) {
    console.info('invalid email', { req: req._log(), email })
    throw new Error(t('api/email/invalid'))
  }
  if (await pgdb.public.users.findFirst({ email })) {
    console.error('updateEmail email exists', { req: req._log() })
    throw new Error(t('api/email/change/exists'))
  }

  const user = await resolveUser({ slug: foreignUserId, pgdb, fallback: me })
  Roles.ensureUserIsMeOrInRoles(user, me, ['supporter', 'admin'])
  if (!user) {
    console.error('user not found', { req: req._log() })
    throw new Error(t('api/users/404'))
  }
  if (user.email === email) {
    return user
  }

  try {
    return await updateUserEmail({
      pgdb,
      userId: user.id,
      oldEmail: user.email,
      newEmail: email
    })
  } catch (e) {
    const util = require('util')
    console.error('updateEmail: exception', util.inspect({ req: req._log(), userId: user.id, email, e }, {depth: null}))
    throw e
  }
}
