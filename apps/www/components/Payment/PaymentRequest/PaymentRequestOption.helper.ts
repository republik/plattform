import { PaymentRequestOptions } from '@stripe/stripe-js'

// Omit attributes that are to be set based on default values
export type LeanPaymentRequestOptions = Omit<
  PaymentRequestOptions,
  'country' | 'currency' | 'disableWallets'
>

const DEFAULT_PAYMENT_REQUEST_OPTIONS: Omit<PaymentRequestOptions, 'total'> = {
  country: 'CH',
  currency: 'chf',
  disableWallets: ['browserCard'],
}

// Take a partial options object and enrich with default values
export function makePaymentRequestOptions(
  leanOptions: LeanPaymentRequestOptions,
): PaymentRequestOptions {
  return {
    ...DEFAULT_PAYMENT_REQUEST_OPTIONS,
    ...leanOptions,
  }
}
