export class CheckoutProcessingError extends Error {
  constructor(msg: string) {
    super(msg)
    this.name = 'CheckoutProcessingError'
  }
}

export class GiftNotApplicableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'api/gifts/error/gift_not_applicable'
  }
}

export class GiftAlreadyAppliedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'api/gifts/error/gift_already_applied'
  }
}
