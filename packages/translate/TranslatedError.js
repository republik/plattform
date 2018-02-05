class TranslatedError extends Error {
  constructor (message) {
    super(message)
    if (this.translatedMessage) {
      this.message = this.translatedMessage()
    }
  }
}

module.exports = TranslatedError
