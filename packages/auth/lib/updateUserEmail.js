const querystring = require('querystring')
const { sendMailTemplate, moveNewsletterSubscriptions } = require('@orbiting/backend-modules-mail')
const t = require('./t')

const {
  FRONTEND_BASE_URL
} = process.env

module.exports = async ({ pgdb, userId, oldEmail, newEmail }) => {
  const transaction = await pgdb.transactionBegin()
  try {
    await transaction.public.sessions.delete(
      {
        'sess @>': {
          passport: {user: userId}
        }
      })
    await transaction.public.users.updateAndGetOne(
      {
        id: userId
      }, {
        email: newEmail,
        verified: false
      }
    )
    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }

  await sendMailTemplate({
    to: oldEmail,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/change/confirmation/subject'),
    templateName: 'cf_email_change_old_address',
    globalMergeVars: [
      { name: 'EMAIL',
        content: newEmail
      }
    ]
  })

  await sendMailTemplate({
    to: newEmail,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/email/change/confirmation/subject'),
    templateName: 'cf_email_change_new_address',
    globalMergeVars: [
      { name: 'LOGIN_LINK',
        content: `${FRONTEND_BASE_URL}/konto?${querystring.stringify({ email: newEmail })}`
      }
    ]
  })

  const user = pgdb.public.users.findOne({ email: newEmail })

  try {
    await moveNewsletterSubscriptions({
      user: {
        email: oldEmail
      },
      newEmail
    })
  } catch (e) {
    console.error(e)
  }

  return user
}
