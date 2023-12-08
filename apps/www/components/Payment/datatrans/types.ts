export const DatatransPaymentMethodPrefix = 'DATATRANS'

export enum DatatransPaymentMethod {
  CREDITCARD = `${DatatransPaymentMethodPrefix}-CREDITCARD`,
  POSTFINANCE = `${DatatransPaymentMethodPrefix}-POSTFINANCE`,
  PAYPAL = `${DatatransPaymentMethodPrefix}-PAYPAL`,
  TWINT = `${DatatransPaymentMethodPrefix}-TWINT`,
}

type DatatransService = keyof typeof DatatransPaymentMethod

export const getDatatransService = (
  method: DatatransPaymentMethod,
): DatatransService => {
  switch (method) {
    case DatatransPaymentMethod.CREDITCARD:
      return 'CREDITCARD'
    case DatatransPaymentMethod.POSTFINANCE:
      return 'POSTFINANCE'
    case DatatransPaymentMethod.PAYPAL:
      return 'PAYPAL'
    case DatatransPaymentMethod.TWINT:
      return 'TWINT'
  }
}

export const DatatransRefnoQueryParam = 'refno'
