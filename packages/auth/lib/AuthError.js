const { TranslatedError } = require('@orbiting/backend-modules-translate')
const t = require('./t')

class AuthError extends TranslatedError {
  constructor (type, meta, replacements) {
    const message = `${type} ${JSON.stringify(meta)}`
    super(message, replacements)
    this.name = 'AuthError'
    Error.captureStackTrace(this, this.constructor)
    this.type = type
    this.meta = meta
  }

  static newAuthError (contextCode, i18nKey) {
    class DynamicAuthError extends AuthError {
      constructor (meta, replacements) {
        super(contextCode, meta, replacements)
        Error.captureStackTrace(this, this.constructor)
      }
      translatedMessage (message, replacements) {
        return t(i18nKey, replacements, message)
      }
    }
    return DynamicAuthError
  }
}

module.exports = AuthError
