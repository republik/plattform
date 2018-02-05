const { TranslatedError } = require('@orbiting/backend-modules-translate')
const t = require('./t')

class AuthError extends TranslatedError {
  constructor (type, meta) {
    const message = `${type} ${JSON.stringify(meta)}`
    super(message)
    this.name = 'AuthError'
    Error.captureStackTrace(this, this.constructor)
    this.type = type
    this.meta = meta
  }

  static newAuthError (contextCode, i18nKey) {
    class DynamicAuthError extends AuthError {
      constructor (meta) {
        super(contextCode, meta)
        Error.captureStackTrace(this, this.constructor)
      }
      translatedMessage (message) {
        return t(i18nKey, this.meta, message)
      }
    }
    return DynamicAuthError
  }
}

module.exports = AuthError
