const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const crypto = require('node:crypto')
const t = require('../t')

const CODE_LENGTH = 6
const TTL_IN_MS = 1000 * 60 * 10 // 10 minutes
const Type = 'EMAIL_CODE'

function generateNumericToken(length) {
  let token = ''
  for (let i = 0; i < length; i++) {
    token += crypto.randomInt(0, 10) // 0–9 inclusive
  }
  return token
}

const { DEFAULT_MAIL_FROM_ADDRESS } = process.env

module.exports = {
  Type,
  generateNewToken: async ({ email, pgdb }) => {
    // Find tokens matching Type and email, which have not expired yet.

    const now = new Date()
    await pgdb.public.tokens.update(
      {
        type: Type,
        email,
        'expiresAt >=': now,
      },
      { expiresAt: now },
    )

    const payload = generateNumericToken(CODE_LENGTH)

    const expiresAt = new Date(new Date().getTime() + TTL_IN_MS)
    return { payload, expiresAt }
  },
  startChallenge: async ({ email, token, pgdb, user }) => {
    const isNewUser = typeof user === 'undefined'

    const template = isNewUser ? 'register_signin_code' : 'signin_code'
    const subject = isNewUser
      ? 'api/register/EMAIL_CODE/mail/subject'
      : 'api/signin/EMAIL_CODE/mail/subject'

    return sendMailTemplate(
      {
        to: email,
        fromEmail: DEFAULT_MAIL_FROM_ADDRESS,
        subject: t(subject, { code: token.payload }),
        templateName: template,
        mergeLanguage: 'handlebars',
        globalMergeVars: [{ name: 'code', content: token.payload }],
      },
      { pgdb },
    )
  },
  validateChallenge: async ({ email, session, req, pgdb }, { payload }) => {
    if (session.sid !== req.sessionID) {
      console.warn('Faild validation, sessions did not match', { email })
      return false
    }

    const token = await pgdb.public.tokens.findOne({
      type: Type,
      email,
      payload,
      sessionId: session.id,
      'expiresAt >=': new Date(),
    })

    return token && token.id
  },
}
