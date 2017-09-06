const uuid = require('uuid/v4')
const sendMail = require('./sendMail')
const querystring = require('querystring')
const isEmail = require('email-validator').validate
const kraut = require('kraut')
const geoForIP = require('./geo/geoForIP')
const fetch = require('isomorphic-unfetch')

const {
  PUBLIC_URL,
  AUTO_LOGIN,
  BASIC_AUTH_USER,
  BASIC_AUTH_PASS
} = process.env

module.exports = async (_email, pgdb, req, t) => {
  if (req.user) {
    return {phrase: ''}
  }

  if (!isEmail(_email)) {
    console.info('invalid email', {
      req,
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
        console.error('auth: error saving session', { req, err })
        return reject((t('api/auth/errorSavingSession')))
      }
      return resolve()
    })
  })

  const verificationUrl =
    (PUBLIC_URL || 'http://' + req.headers.host) +
    '/auth/email/signin/?' +
    querystring.stringify({email, token})

  // AUTO_LOGIN for automated testing
  if (AUTO_LOGIN) {
    // email addresses @test.project-r.construction will be auto logged in
    // - email addresses containing «not» will neither be logged in nor send an sign request
    const testMatch = email.match(/^([a-zA-Z0-9._%+-]+)@test\.project-r\.construction$/)
    if (testMatch) {
      if (testMatch[1].indexOf('not') === -1) {
        setTimeout(() => {
          if (BASIC_AUTH_PASS) {
            fetch(verificationUrl, {
              headers: {
                'Authorization': 'Basic ' + (Buffer.from(BASIC_AUTH_USER + ':' + BASIC_AUTH_PASS).toString('base64'))
              }
            })
          } else {
            fetch(verificationUrl)
          }
        }, 2000)
      }
      return {phrase}
    }
  }

  await sendMail({
    to: email,
    fromEmail: process.env.AUTH_MAIL_FROM_ADDRESS,
    subject: 'signin link',
    text: `
Hi!
${geoString ? '\nLogin attempt from ' + geoString + '\n' : ''}
Verify that the provided security code matches *${phrase}* before proceeding.

Then please follow this link to signin.
${verificationUrl}
`
  })

  return {phrase}
}
