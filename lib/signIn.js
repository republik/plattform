const uuid = require('uuid/v4')
const sendMail = require('./sendMail')
const querystring = require('querystring')
const isEmail = require('email-validator').validate

module.exports = async (_email, pgdb, req) => {
  if (req.user) {
    return {phrase: ''}
  }

  if (!isEmail(_email)) {
    console.info('invalid email', {
      req: req._log(),
      _email
    })
    throw new Error('invalid email')
  }

  // find existing email with different cases
  const email = (await pgdb.public.users.findOneFieldOnly({
    email: _email
  }, 'email')) || _email

  const token = uuid()
  const phrase = Math.random().toString(36).substring(7)

  req.session.email = email
  req.session.token = token

  await new Promise(function (resolve, reject) {
    req.session.save(function (err) {
      if (err) {
        console.error('auth: error saving session', { req: req._log(), err })
        return reject(new Error('failed to save session'))
      }
      return resolve()
    })
  })

  const verificationUrl =
    (process.env.PUBLIC_URL || 'http://' + req.headers.host) +
    '/auth/email/signin/?' +
    querystring.stringify({email, token})

  await sendMail({
    to: email,
    fromEmail: process.env.AUTH_MAIL_FROM_ADDRESS,
    subject: 'signin link',
    text: `
To login please first check the random chars:

${phrase}

If they are correct, signin following this link:
${verificationUrl}
`
  })

  return {phrase}
}
