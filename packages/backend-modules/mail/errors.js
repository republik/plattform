const SUBSCRIPTION_CONFIG_MISSING_ERROR = 'SUBSCRIPTION_CONFIG_MISSING_ERROR'
const SEND_ERROR = 'SEND_ERROR'

class MailError extends Error {
  constructor(type, meta) {
    const message = `mail error: ${type} ${JSON.stringify(meta)}`
    super(message)
    this.type = type
    this.meta = meta
  }
}

class SubscriptionConfigurationMissingMailError extends MailError {
  constructor(meta) {
    super(SUBSCRIPTION_CONFIG_MISSING_ERROR, meta)
  }
}

class SendMailError extends MailError {
  constructor(meta) {
    super(SEND_ERROR, meta)
  }
}

module.exports = {
  SubscriptionConfigurationMissingMailError,
  SendMailError,
}
