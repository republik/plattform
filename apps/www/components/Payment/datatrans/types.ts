export const DatatransPledgeIdQueryParam = 'pledgeId'

/**
 * Payment methods available.
 *
 */
export enum DatatransPaymentMethod {
  CreditCard = 'DATATRANS_CREDITCARD',
  PostfinanceCard = 'DATATRANS_POSTFINANCECARD',
  PayPal = 'DATATRANS_PAYPAL',
  Twint = 'DATATRANS_TWINT',
}

export const DatatransPaymentMethods = [
  DatatransPaymentMethod.CreditCard,
  DatatransPaymentMethod.PostfinanceCard,
  DatatransPaymentMethod.PayPal,
  DatatransPaymentMethod.Twint,
]
