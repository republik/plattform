const NEWSLETTER_MEMBER_ERROR = 'NEWSLETTER_MEMBER_ERROR'
const EMAIL_REQUIRED_ERROR = 'EMAIL_REQUIRED_ERROR'
const SUBSCRIPTION_HANDLER_MISSING_ERROR = 'SUBSCRIPTION_HANDLER_MISSING_ERROR'

class MailError extends Error {
  type: string
  meta?: any
  constructor(type, meta?) {
    const message = `mail error: ${type} ${JSON.stringify(meta)}`
    super(message)
    this.type = type
    this.meta = meta
  }
}

class NewsletterMemberMailError extends MailError {
  constructor(meta?) {
    super(NEWSLETTER_MEMBER_ERROR, meta)
  }
}

class EmailRequiredMailError extends MailError {
  constructor(meta?) {
    super(EMAIL_REQUIRED_ERROR, meta)
  }
}

class SubscriptionHandlerMissingMailError extends MailError {
  constructor(meta?) {
    super(SUBSCRIPTION_HANDLER_MISSING_ERROR, meta)
  }
}


export {
  NewsletterMemberMailError,
  EmailRequiredMailError,
  SubscriptionHandlerMissingMailError
}
