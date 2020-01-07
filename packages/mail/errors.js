const NEWSLETTER_MEMBER_ERROR = 'NEWSLETTER_MEMBER_ERROR'
const ROLES_NOT_ELIGIBLE_ERROR = 'ROLES_NOT_ELIGIBLE_ERROR'
const INTERESTID_NOT_FOUND_ERROR = 'INTERESTID_NOT_FOUND_ERROR'
const EMAIL_REQUIRED_ERROR = 'EMAIL_REQUIRED_ERROR'
const SUBSCRIPTION_CONFIG_MISSING_ERROR = 'SUBSCRIPTION_CONFIG_MISSING_ERROR'
const SUBSCRIPTION_HANDLER_MISSING_ERROR = 'SUBSCRIPTION_HANDLER_MISSING_ERROR'
const SEND_ERROR = 'SEND_ERROR'

class MailError extends Error {
  constructor (type, meta) {
    const message = `mail error: ${type} ${JSON.stringify(meta)}`
    super(message)
    this.type = type
    this.meta = meta
  }
}

class SubscriptionConfigurationMissingMailError extends MailError {
  constructor (meta) {
    super(SUBSCRIPTION_CONFIG_MISSING_ERROR, meta)
  }
}

class SubscriptionHandlerMissingMailError extends MailError {
  constructor (meta) {
    super(SUBSCRIPTION_HANDLER_MISSING_ERROR, meta)
  }
}

class NewsletterMemberMailError extends MailError {
  constructor (meta) {
    super(NEWSLETTER_MEMBER_ERROR, meta)
  }
}

class RolesNotEligibleMailError extends MailError {
  constructor (meta) {
    super(ROLES_NOT_ELIGIBLE_ERROR, meta)
  }
}

class InterestIdNotFoundMailError extends MailError {
  constructor (meta) {
    super(INTERESTID_NOT_FOUND_ERROR, meta)
  }
}

class EmailRequiredMailError extends MailError {
  constructor (meta) {
    super(EMAIL_REQUIRED_ERROR, meta)
  }
}

class SendMailError extends MailError {
  constructor (meta) {
    super(SEND_ERROR, meta)
  }
}

module.exports = {
  NewsletterMemberMailError,
  RolesNotEligibleMailError,
  InterestIdNotFoundMailError,
  EmailRequiredMailError,
  SubscriptionConfigurationMissingMailError,
  SubscriptionHandlerMissingMailError,
  SendMailError
}
