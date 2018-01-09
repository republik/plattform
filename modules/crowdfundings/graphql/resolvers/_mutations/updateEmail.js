const { Roles, ensureSignedIn } = require('@orbiting/backend-modules-auth')
const logger = console
const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const isEmail = require('email-validator').validate
const querystring = require('querystring')
const updateUserOnMailchimp = require('../../../lib/updateUserOnMailchimp')
const unsubscribeFromMailchimp = require('../../../lib/unsubscribeFromMailchimp')
const { transformUser } = require('@orbiting/backend-modules-auth')

const {
  FRONTEND_BASE_URL
} = process.env

module.exports = async (_, args, {pgdb, req, t}) => {
  ensureSignedIn(req, t)
  const {email} = args

  if (!isEmail(email)) {
    logger.info('invalid email', { req: req._log(), email })
    throw new Error(t('api/email/invalid'))
  }
  if (await pgdb.public.users.findFirst({email})) {
    logger.error('updateEmail email exists', { req: req._log() })
    throw new Error(t('api/email/change/exists'))
  }

  const user = args.userId
    ? transformUser(await pgdb.public.users.findOne({id: args.userId}))
    : req.user

  Roles.ensureUserIsMeOrInRoles(user, req.user, ['supporter', 'admin'])

  if (!user) {
    logger.error('user not found', { req: req._log() })
    throw new Error(t('api/users/404'))
  }
  if (user.email === email) {
    return user
  }

  const transaction = await pgdb.transactionBegin()
  try {
    await transaction.public.sessions.delete(
      {
        'sess @>': {
          passport: {user: user.id}
        }
      })
    await transaction.public.users.updateAndGetOne(
      {
        id: user.id
      }, {
        email,
        verified: false
      }
    )
    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    logger.info('transaction rollback', { req: req._log(), args, error: e })
    throw e
  }

  await sendMailTemplate({
    to: user.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/change/confirmation/subject'),
    templateName: 'cf_email_change_old_address',
    globalMergeVars: [
      { name: 'EMAIL',
        content: email
      }
    ]
  })

  const loginLink =
    (FRONTEND_BASE_URL || 'http://' + req.headers.host) +
    '/konto?' +
    querystring.stringify({email})
  await sendMailTemplate({
    to: email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/change/confirmation/subject'),
    templateName: 'cf_email_change_new_address',
    globalMergeVars: [
      { name: 'LOGIN_LINK',
        content: loginLink
      }
    ]
  })

  unsubscribeFromMailchimp({
    email: user.email
  })
  updateUserOnMailchimp({
    userId: user.id,
    pgdb
  })

  return pgdb.public.users.findOne({email})
}
