import { DatatransPaymentMethod, DatatransPaymentMethods } from './types'

export const isDatatransPaymentMethod = (method?: DatatransPaymentMethod) =>
  method && DatatransPaymentMethods.includes(method)
