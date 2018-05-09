const uuid = require('uuid/v4')
const querystring = require('querystring')
const validator = require('validator')
const kraut = require('kraut')
const geoForIP = require('./geoForIP')
const checkEnv = require('check-env')
const t = require('./t')
const debug = require('debug')('auth')
const { authorizeSession } = require('./Sessions')
const {
  sendMail,
  sendMailTemplate
} = require('@orbiting/backend-modules-mail')
const { encode } = require('@orbiting/backend-modules-base64u')

checkEnv([
  'FRONTEND_BASE_URL',
  'AUTH_MAIL_FROM_ADDRESS'
])

const {
  AUTH_MAIL_FROM_ADDRESS,
  FRONTEND_BASE_URL,
  AUTO_LOGIN,
  AUTH_MAIL_TEMPLATE_NAME,
  AUTH_MAIL_SUBJECT
} = process.env

module.exports = async (_email, context, pgdb, req) => {
  if (req.user) {
    return {phrase: ''}
  }

  if (!validator.isEmail(_email)) {
    debug('invalid email: %O', {
      req: req._log(),
      _email
    })
    throw new Error(t('api/email/invalid'))
  }

  // find existing email with different cases
  const email = (await pgdb.public.users.findOneFieldOnly({
    email: _email
  }, 'email')) || _email

  const token = uuid()
  const phrase = kraut.adjectives.random() + ' ' + kraut.verbs.random() + ' ' + kraut.nouns.random()
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  const ua = req.headers['user-agent']
  const { country, city } = geoForIP(ip)
  let geoString = country
  if (geoString === 'Schweiz') {
    geoString = 'der ' + geoString
  }

  req.session.email = email
  req.session.token = token
  req.session.ip = ip
  req.session.ua = ua
  if (country || city) {
    req.session.geo = { country, city }
  }

  await new Promise(function (resolve, reject) {
    req.session.save(function (err) {
      if (err) {
        console.error('auth: error saving session', { req: req._log(), err })
        return reject((t('api/auth/errorSavingSession')))
      }
      return resolve()
    })
  })

  const verificationUrl =
    `${FRONTEND_BASE_URL}/mitteilung?` +
    querystring.stringify({
      type: 'token-authorization',
      email: encode(email),
      context,
      token
    })

  // AUTO_LOGIN for automated testing
  if (AUTO_LOGIN) {
    // email addresses @test.project-r.construction will be auto logged in
    // - email addresses containing «not» will neither be logged in nor send an sign request
    const testMatch = email.match(/^([a-zA-Z0-9._%+-]+)@test\.project-r\.construction$/)
    if (testMatch) {
      if (testMatch[1].indexOf('not') === -1) {
        setTimeout(async () => {
          console.log('AUTO_LOGIN!')
          await authorizeSession({ pgdb, token, emailFromQuery: email })
        }, 2000)
      }
      return {phrase}
    }
  }

  if (AUTH_MAIL_TEMPLATE_NAME) {
    await sendMailTemplate({
      to: email,
      fromEmail: AUTH_MAIL_FROM_ADDRESS,
      subject: AUTH_MAIL_SUBJECT || t('api/signin/mail/subject'),
      templateName: AUTH_MAIL_TEMPLATE_NAME,
      globalMergeVars: [
        { name: 'LOCATION',
          content: geoString
        },
        { name: 'SECRET_WORDS',
          content: phrase
        },
        { name: 'LOGIN_LINK',
          content: verificationUrl
        }
      ]
    })
  } else {
    await sendMail({
      to: email,
      fromEmail: AUTH_MAIL_FROM_ADDRESS,
      subject: AUTH_MAIL_SUBJECT || t('api/signin/mail/subject'),
      text: `
Hi!
${geoString ? '\nLogin attempt from ' + geoString + '\n' : ''}
Verify that the provided security code matches *${phrase}* before proceeding.

Then please follow this link to signin.
${verificationUrl}
`
    })
  }

  return { phrase }
}
