const isEmail = require('email-validator').validate
const debug = require('debug')('auth')
const {
  authorizeSession,
  initiateSession
} = require('./Sessions')
const {
  generateNewToken,
  startChallenge,
  TokenTypes
} = require('./Tokens')
const {
  SessionInitializationFailedError,
  EmailInvalidError
} = require('./errors')

const {
  AUTO_LOGIN
} = process.env

module.exports = async (_email, context, pgdb, req) => {
  if (req.user) {
    return {phrase: ''}
  }

  if (!isEmail(_email)) {
    debug('invalid email: %O', {
      req: req._log(),
      _email
    })
    throw new EmailInvalidError({ email: _email })
  }

  // find existing email with different cases
  const email = (await pgdb.public.users.findOneFieldOnly({
    email: _email
  }, 'email')) || _email

  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const userAgent = req.headers['user-agent']

    const init = await initiateSession({ req, pgdb, ipAddress, userAgent, email })
    const { country, phrase, session } = init

    const type = TokenTypes.EMAIL_TOKEN
    const token = await generateNewToken({ pgdb, type, session })
    if (shouldAutoLogin({ email })) {
      setTimeout(async () => {
        console.log('AUTO_LOGIN!')
        await authorizeSession({
          pgdb,
          tokens: [token],
          emailFromQuery: email
        })
      }, 2000)
    } else {
      await startChallenge({ pgdb, email, type, token, context, country, phrase })
    }
    return { phrase }
  } catch (error) {
    throw new SessionInitializationFailedError({ error })
  }
}

const shouldAutoLogin = ({ email }) => {
  if (AUTO_LOGIN) {
    // email addresses @test.project-r.construction will be auto logged in
    // - email addresses containing «not» will neither be logged in nor send an sign request
    const testMatch = email.match(/^([a-zA-Z0-9._%+-]+)@test\.project-r\.construction$/)
    if (testMatch) {
      if (testMatch[1].indexOf('not') === -1) {
        return true
      }
    }
  }
  return false
}
