import { PaymentRequestOptions, PaymentRequestWallet } from '@stripe/stripe-js'

// Omit attributes that are to be set based on default values
export type LeanPaymentRequestOptions = Omit<
  PaymentRequestOptions,
  'country' | 'currency' | 'disableWallets'
>

const DEFAULT_PAYMENT_REQUEST_OPTIONS: Omit<PaymentRequestOptions, 'total'> = {
  country: 'CH',
  currency: 'chf',
  disableWallets: ['browserCard', 'applePay', 'googlePay'],
}

// Take a partial options object and enrich with default values
export function makePaymentRequestOptions(
  leanOptions: LeanPaymentRequestOptions,
  enabledWallet: PaymentRequestWallet,
): PaymentRequestOptions {
  return {
    ...DEFAULT_PAYMENT_REQUEST_OPTIONS,
    ...leanOptions,
    // disable all wallets expect the given one
    disableWallets: DEFAULT_PAYMENT_REQUEST_OPTIONS.disableWallets.filter(
      (wallet) => wallet !== enabledWallet,
    ),
  }
}
