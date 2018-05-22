class TranslatedError extends Error {
  constructor (message, replacements) {
    super(message)
    if (this.translatedMessage) {
      this.message = this.translatedMessage(message, replacements)
    }
  }
}

module.exports = TranslatedError
