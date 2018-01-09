const ERROR_QUERY_EMAIL_MISMATCH = 'query-email-mismatch'
const ERROR_NO_SESSION = 'no-session'

class VerifyTokenError extends Error {
  constructor (type, meta) {
    const message = `verify-token-error: ${type} ${JSON.stringify(meta)}`
    super(message)
    this.type = type
    this.meta = meta
  }
}

class QueryEmailMismatchError extends VerifyTokenError {
  constructor (meta) {
    super(ERROR_QUERY_EMAIL_MISMATCH, meta)
  }
}

class NoSessionError extends VerifyTokenError {
  constructor (meta) {
    super(ERROR_NO_SESSION, meta)
  }
}

const signInWithToken = async ({ pgdb, token, emailFromQuery, signInHooks = [] }) => {
  const Users = pgdb.public.users
  const Sessions = pgdb.public.sessions
  const session = await Sessions.findOne({
    'sess @>': { token }
  })
  if (!session) {
    throw new NoSessionError({ token, emailFromQuery })
  }

  const {
    email
  } = session.sess
  if (emailFromQuery && email !== emailFromQuery) { // emailFromQuery might be null for old links
    throw new QueryEmailMismatchError({ token, email, emailFromQuery })
  }

  // verify and/or create the user
  const existingUser = await Users.findOne({
    email
  })
  const user = existingUser ||
    await Users.insertAndGet({
      email,
      verified: true
    })
  if (!user.verified) {
    await Users.updateOne({
      id: user.id
    }, {
      verified: true
    })
  }

  // log in the session and delete token
  await Sessions.updateOne({
    sid: session.sid
  }, {
    sess: {
      ...session.sess,
      token: null,
      passport: {
        user: user.id
      }
    }
  })

  // call signIn hooks
  await Promise.all(
    signInHooks.map(hook =>
      hook(user.id, pgdb)
    )
  )

  return user
}

module.exports = {
  signInWithToken,
  QueryEmailMismatchError,
  NoSessionError
}
