const ERROR_QUERY_EMAIL_MISMATCH = 'query-email-mismatch'
const ERROR_NO_SESSION = 'no-session'
const ERROR_SESSION_DESTROY_FAILED = 'session-destroy-failed'

class AuthError extends Error {
  constructor (type, meta) {
    const message = `verify-token-error: ${type} ${JSON.stringify(meta)}`
    super(message)
    this.type = type
    this.meta = meta
  }
}

class DestroySessionError extends AuthError {
  constructor (meta) {
    super(ERROR_SESSION_DESTROY_FAILED, meta)
  }
}

class QueryEmailMismatchError extends AuthError {
  constructor (meta) {
    super(ERROR_QUERY_EMAIL_MISMATCH, meta)
  }
}

class NoSessionError extends AuthError {
  constructor (meta) {
    super(ERROR_NO_SESSION, meta)
  }
}

module.exports = {
  QueryEmailMismatchError,
  NoSessionError,
  DestroySessionError
}
