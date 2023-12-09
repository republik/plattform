export type DatatransBody = {
  paymentMethods: string[]
  option: {
    createAlias: boolean
  }
}

/**
 * Payment methods provided by Datatrans
 *
 * @see https://docs.datatrans.ch/docs/payment-methods
 */
export enum DatatransPaymentMethod {
  MasterCard = 'ECA',
  Visa = 'VIS',
  AmericanExpress = 'AMX',
  ApplePay = 'APL',
  GooglePay = 'PAY',
  PostfinanceCard = 'PFC',
  PayPal = 'PAP',
  Twint = 'TWI',
}

/**
 * Datatrans transaction reponse object (status)
 *
 * @see https://api-reference.datatrans.ch/#tag/v1transactions/operation/status
 */
export type DatatransTransaction = {
  transactionId: string
  merchatId: string
  type: 'payment' | 'credit' | 'card_check'
  status:
    | 'initialized'
    | 'challenge_required'
    | 'challenge_ongoing'
    | 'authenticated'
    | 'authorized'
    | 'settled'
    | 'canceled'
    | 'transmitted'
    | 'failed'
  currency: 'CHF'
  refno: string
  refno2?: string
  paymentMethod: DatatransPaymentMethod
  detail: {
    init?: { expires: string }
    authorize?: {
      amount: number
      acquirerAuthorizationCode: string
    }
    settle?: { amount: number }
    credit?: { amount: number }
    cancel?: { reversal: boolean }
    fail?: {
      reason:
        | 'card_invalid'
        | 'declined'
        | 'soft_declined'
        | 'incomplete'
        | 'timeout'
        | 'invalid_setup'
        | 'secure_authentication'
        | 'error_on_start'
        | 'referral'
        | 'error'
      message: string
    }
  }
  language:
    | 'en'
    | 'de'
    | 'fr'
    | 'it'
    | 'es'
    | 'el'
    | 'fi'
    | 'hu'
    | 'ko'
    | 'nl'
    | 'no'
    | 'da'
    | 'pl'
    | 'pt'
    | 'ru'
    | 'ja'
    | 'sk'
    | 'sl'
    | 'sv'
    | 'tr'
    | 'zh'
  history: {
    ip: string
    date: string
    action:
      | 'init'
      | 'authenticate'
      | 'authorize'
      | 'settle'
      | 'credit'
      | 'cancel'
      | 'change_details'
    autoSettle?: boolean // Only applicable if action was authorize
    amount: number
    source:
      | 'admin'
      | 'amadeus'
      | 'ajax'
      | 'android'
      | 'api'
      | 'inline'
      | 'ios'
      | 'lightbox'
      | 'link'
      | 'redirect'
      | 'secure_fields'
      | 'system'
      | 'web'
      | 'web_hidden'
      | 'unknown'
    success: boolean

    /**
     * props mentioned in Datatrans documentation, but not "typified" yet
     */
    customer?: any
    marketplace?: any
    cdm?: string
    accertify?: string
    ep2?: any
    dcc?: any
    multiCurrencyProcessing?: any
    avs?: any
  }[]
}

type DatatransTransactionCard = {
  alias: string
  fingerprint: string
  masked: string
  aliasCVV?: string // Will be deleted immediately after authorization.
  expiryMonth: number
  expiryYear: number
  info: {
    brand: string
    type: 'credit' | 'debit' | 'prepaid'
    usage: 'consumer' | 'corporate' | 'unknown'
    country: string
    issuer: string
  }
  walletIndicator?:
    | DatatransPaymentMethod.ApplePay
    | DatatransPaymentMethod.GooglePay
    | 'SAM'
    | 'VPS'
    | 'MBP'

  /**
   * props mentioned in Datatrans documentation, but not "typified" yet
   */
  '3D'?: any
  networkToken?: any
}

type DatatransTransactionPostfinanceCard = {
  alias?: string
  masked: string
  expiryMonth: string
  expiryYear: string
}

type DatatransTransactionPayPal = {
  alias?: string
  orderId?: string
  payerId?: string
}

type DatatransTransactionTwint = {
  alias: string
  fingerprint: string
}

export type DatatransTransactionWithMethod =
  | (DatatransTransaction & {
      paymentMethod: DatatransPaymentMethod.MasterCard
      card: DatatransTransactionCard
    })
  | (DatatransTransaction & {
      paymentMethod: DatatransPaymentMethod.Visa
      card: DatatransTransactionCard
    })
  | (DatatransTransaction & {
      paymentMethod: DatatransPaymentMethod.AmericanExpress
      card: DatatransTransactionCard
    })
  | (DatatransTransaction & {
      paymentMethod: DatatransPaymentMethod.PostfinanceCard
      [DatatransPaymentMethod.PostfinanceCard]: DatatransTransactionPostfinanceCard
    })
  | (DatatransTransaction & {
      paymentMethod: DatatransPaymentMethod.PayPal
      [DatatransPaymentMethod.PayPal]: DatatransTransactionPayPal
    })
  | (DatatransTransaction & {
      paymentMethod: DatatransPaymentMethod.Twint
      [DatatransPaymentMethod.Twint]: DatatransTransactionTwint
    })

type DatatransAliasCard = {
  card: Pick<DatatransTransactionCard, 'alias' | 'expiryMonth' | 'expiryYear'>
}

type DatatransAliasPostfinanceCard = {
  [DatatransPaymentMethod.PostfinanceCard]: Pick<
    DatatransTransactionPostfinanceCard,
    'alias'
  >
}

type DatatransAliasPayPal = {
  [DatatransPaymentMethod.PayPal]: Pick<DatatransTransactionPayPal, 'alias'>
}

type DatatransAliasTwint = {
  [DatatransPaymentMethod.Twint]: Pick<DatatransTransactionTwint, 'alias'>
}

export type DatatransAlias =
  | DatatransAliasCard
  | DatatransAliasPostfinanceCard
  | DatatransAliasPayPal
  | DatatransAliasTwint
