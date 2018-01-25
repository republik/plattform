const ERROR_QUERY_EMAIL_MISMATCH = 'query-email-mismatch'
const ERROR_NO_SESSION = 'no-session'
const ERROR_SESSION_DESTROY_FAILED = 'session-destroy-failed'
const ERROR_TIME_BASED_PASSWORD_MISMATCH = 'time-based-password-mismatch'
const ERROR_SESSION_INIT_FAILED = 'session-init-failed'
const ERROR_EMAIL_INVALID = 'email-invalid'
const ERROR_SESSION_INITIALIZATION_FAILED = 'session-initialization-failed'
const ERROR_TOKEN_TYPE_UNKNOWN = 'token-type-unknown'

class AuthError extends Error {
  constructor (type, meta) {
    const message = `auth exception: ${type} ${JSON.stringify(meta)}`
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

class InitiateSessionError extends AuthError {
  constructor (meta) {
    super(ERROR_SESSION_INIT_FAILED, meta)
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

class TimeBasedPasswordMismatchError extends AuthError {
  constructor (meta) {
    super(ERROR_TIME_BASED_PASSWORD_MISMATCH, meta)
  }
}

class EmailInvalidError extends AuthError {
  constructor (meta) {
    super(ERROR_EMAIL_INVALID, meta)
  }
}

class SessionInitializationFailedError extends AuthError {
  constructor (meta) {
    super(ERROR_SESSION_INITIALIZATION_FAILED, meta)
  }
}

class TokenTypeUnknownError extends AuthError {
  constructor (meta) {
    super(ERROR_TOKEN_TYPE_UNKNOWN, meta)
  }
}

module.exports = {
  QueryEmailMismatchError,
  NoSessionError,
  DestroySessionError,
  InitiateSessionError,
  EmailInvalidError,
  SessionInitializationFailedError,
  TimeBasedPasswordMismatchError,
  TokenTypeUnknownError
}
