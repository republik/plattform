const isEmail = require('email-validator').validate
const { Roles, ensureSignedIn } = require('@orbiting/backend-modules-auth')
const updateUserEmail = require('../../../lib/updateUserEmail')

module.exports = async (_, args, { pgdb, user: me, req, t }) => {
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

  const user = foreignUserId
    ? (await pgdb.public.users.findOne({ id: foreignUserId }))
    : me

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
      t,
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
