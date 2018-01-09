const { NoSessionError, QueryEmailMismatchError } = require('./errors')

const sessionByToken = async ({ pgdb, token, email: emailFromQuery, ...meta }) => {
  const Sessions = pgdb.public.sessions
  const session = await Sessions.findOne({
    'sess @>': { token }
  })
  if (!session) {
    throw new NoSessionError({ token, emailFromQuery, ...meta })
  }

  const { email } = session.sess
  if (emailFromQuery && email !== emailFromQuery) { // emailFromQuery might be null for old links
    throw new QueryEmailMismatchError({ token, email, emailFromQuery })
  }

  return session
}

module.exports = sessionByToken
