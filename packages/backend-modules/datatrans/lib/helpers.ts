import debug from 'debug'
import {
  DatatransAlias,
  DatatransBody,
  DatatransPaymentMethod,
  DatatransTransactionWithMethod,
} from './types'

const log = debug('datatrans:lib:helpers')

export enum DatatransService {
  CREDITCARD = 'CREDITCARD',
  POSTFINANCE = 'POSTFINANCE',
  PAYPAL = 'PAYPAL',
  TWINT = 'TWINT',
}

const SERVICE_INIT_BODY: Record<
  InitTransactionWithServiceProps['service'],
  (props: InitTransactionWithServiceProps) => Partial<DatatransBody>
> = {
  CREDITCARD: () => ({
    paymentMethods: [
      DatatransPaymentMethod.MasterCard,
      DatatransPaymentMethod.Visa,
      DatatransPaymentMethod.AmericanExpress,
      DatatransPaymentMethod.ApplePay,
      DatatransPaymentMethod.GooglePay,
    ],
    option: {
      createAlias: true,
    },
  }),
  POSTFINANCE: (props) => ({
    paymentMethods: [DatatransPaymentMethod.PostfinanceCard],
    option: {
      createAlias: !!props.createAlias,
    },
  }),
  PAYPAL: (props) => ({
    amount: props.createAlias ? 0 : props.amount,
    paymentMethods: [DatatransPaymentMethod.PayPal],
    option: {
      createAlias: !!props.createAlias,
    },
  }),
  TWINT: (props) => ({
    amount: props.createAlias ? 0 : props.amount,
    paymentMethods: [DatatransPaymentMethod.Twint],
    option: {
      createAlias: !!props.createAlias,
    },
  }),
}

const Authorization =
  'Basic ' +
  Buffer.from(
    process.env.DATATRANS_MERCHANT_ID +
      ':' +
      process.env.DATATRANS_MERCHANT_PASSWORD,
  ).toString('base64')

type InitTransactionWithServiceProps = {
  refno: string
  amount: number
  service: DatatransService
  createAlias?: boolean
}

type InitTransactionWithAliasProps = {
  refno: string
  amount: number
  useAlias: DatatransAlias
}

type InitTransactionReturn = {
  authorizeUrl: string
}

type InitTransaction = {
  ({
    refno,
    amount,
    service,
  }: InitTransactionWithServiceProps): Promise<InitTransactionReturn>
  ({
    refno,
    amount,
    useAlias,
  }: InitTransactionWithAliasProps): Promise<InitTransactionReturn>
}

export const initTransaction: InitTransaction = async (props) => {
  const l = log.extend('initTransaction')
  l('args %o', props)

  const { refno, amount } = props

  const successUrl = new URL('/angebote', process.env.FRONTEND_BASE_URL)
  successUrl.searchParams.append('refno', `${refno}`)
  successUrl.searchParams.append('status', 'authorized')

  const errorUrl = new URL('/angebote', process.env.FRONTEND_BASE_URL)
  errorUrl.searchParams.append('refno', `${refno}`)
  errorUrl.searchParams.append('amount', `${amount}`)
  errorUrl.searchParams.append('status', 'error')

  const cancelUrl = new URL('/angebote', process.env.FRONTEND_BASE_URL)
  cancelUrl.searchParams.append('refno', `${refno}`)
  cancelUrl.searchParams.append('amount', `${amount}`)
  cancelUrl.searchParams.append('status', 'cancel')

  const body = JSON.stringify({
    refno,
    amount,
    ...('service' in props ? SERVICE_INIT_BODY[props.service](props) : {}),
    ...('useAlias' in props ? { ...pickAliasProps(props.useAlias) } : {}),
    currency: 'CHF',
    autoSettle: false,
    redirect: {
      successUrl: successUrl.toString(),
      errorUrl: errorUrl.toString(),
      cancelUrl: cancelUrl.toString(),
    },
  })

  l('request body %o', body)

  const res = await fetch('https://api.sandbox.datatrans.com/v1/transactions', {
    method: 'POST',
    headers: {
      Authorization,
      'Content-Type': 'application/json',
    },
    body,
  })

  if (!res.ok) {
    throw new Error(
      'Error' +
        JSON.stringify({
          status: res.status,
          statusText: await res.json(),
        }),
    )
  }

  const transaction = await res.json()

  const authorizeUrl = new URL(
    '/v1/start/' + transaction.transactionId,
    'https://pay.sandbox.datatrans.com',
  ).toString()
  l('return %o', { authorizeUrl })

  return { authorizeUrl }
}

export const getTransaction = async (datatransTrxId: string) => {
  const l = log.extend('getTransaction')
  l('args %o', { datatransTrxId })

  const res = await fetch(
    `https://api.sandbox.datatrans.com/v1/transactions/${datatransTrxId}`,
    {
      headers: {
        Authorization,
      },
    },
  )

  if (!res.ok) {
    throw new Error(
      'Error' +
        JSON.stringify({
          status: res.status,
          statusText: await res.json(),
        }),
    )
  }

  const transaction: DatatransTransactionWithMethod = await res.json()
  l('return %o', transaction)

  return transaction
}

export const isPreAuthorized = (datatransTrx: any) => {
  const l = log.extend('isPreAuthorized')
  l('args %o', { datatransTrx })

  const isPreAuthorized =
    datatransTrx.type === 'card_check' && datatransTrx.status === 'authorized'

  l('return %o', { isPreAuthorized })

  return isPreAuthorized
}

type SettleTransactionProps = {
  datatransTrxId: string
  refno: string
  amount: number
}

export const settleTransaction = async (props: SettleTransactionProps) => {
  const l = log.extend('settleTransaction')
  l('args %o', props)

  const { datatransTrxId, refno, amount } = props

  const body = JSON.stringify({
    amount,
    currency: 'CHF',
    refno,
  })

  l('request body %o', body)

  const res = await fetch(
    `https://api.sandbox.datatrans.com/v1/transactions/${datatransTrxId}/settle`,
    {
      method: 'POST',
      headers: {
        Authorization,
        'Content-Type': 'application/json',
      },
      body,
    },
  )

  if (!res.ok) {
    throw new Error(
      'Error' +
        JSON.stringify({
          status: res.status,
          statusText: await res.json(),
        }),
    )
  }

  l('return true')

  return true
}

type AuthorizeAndSettleTransactionProps = {
  refno: string
  amount: number
  alias: DatatransAlias
}

export const getAliasString = (
  transaction: DatatransTransactionWithMethod,
): string | undefined => {
  const aliasString =
    ('card' in transaction && transaction.card.alias) ||
    (DatatransPaymentMethod.PostfinanceCard in transaction &&
      transaction[DatatransPaymentMethod.PostfinanceCard].alias) ||
    (DatatransPaymentMethod.PayPal in transaction &&
      transaction[DatatransPaymentMethod.PayPal].alias) ||
    (DatatransPaymentMethod.Twint in transaction &&
      transaction[DatatransPaymentMethod.Twint].alias)

  if (!aliasString) {
    return undefined
  }

  return aliasString
}

export const pickAliasProps = (alias: DatatransAlias) => {
  const l = log.extend('pickAliasProps')
  l('args %o', alias)

  if ('card' in alias && alias.card.alias) {
    const { card } = alias
    const value = {
      card: {
        alias: card.alias,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
      },
    }
    l('%s: %o', DatatransService.CREDITCARD, value)
    return value
  }

  if (
    DatatransPaymentMethod.PostfinanceCard in alias &&
    alias[DatatransPaymentMethod.PostfinanceCard].alias
  ) {
    const value = {
      [DatatransPaymentMethod.PostfinanceCard]: { alias: alias.PFC.alias },
    }
    l('%s: %o', DatatransService.POSTFINANCE, value)
    return value
  }

  if (
    DatatransPaymentMethod.PayPal in alias &&
    alias[DatatransPaymentMethod.PayPal].alias
  ) {
    const value = {
      [DatatransPaymentMethod.PayPal]: { alias: alias.PAP.alias },
    }
    l('%s: %o', DatatransService.PAYPAL, value)
    return value
  }

  if (
    DatatransPaymentMethod.Twint in alias &&
    alias[DatatransPaymentMethod.Twint].alias
  ) {
    const value = { [DatatransPaymentMethod.Twint]: { alias: alias.TWI.alias } }
    l('%s: %o', DatatransService.TWINT, value)
    return value
  }

  throw new Error('Unable to pick alias props')
}

export const authorizeAndSettleTransaction = async (
  props: AuthorizeAndSettleTransactionProps,
) => {
  const l = log.extend('authorizeAndSettleTransaction')
  l('args %o', props)

  const { refno, amount, alias } = props

  const body = JSON.stringify({
    amount,
    currency: 'CHF',
    refno,
    autoSettle: true,
    ...pickAliasProps(alias),
  })

  l('request body %o', body)

  const res = await fetch(
    `https://api.sandbox.datatrans.com/v1/transactions/authorize`,
    {
      method: 'POST',
      headers: {
        Authorization,
        'Content-Type': 'application/json',
      },
      body,
    },
  )

  if (!res.ok) {
    throw new Error(
      'Error' +
        JSON.stringify({
          status: res.status,
          statusText: await res.json(),
        }),
    )
  }

  const transaction: DatatransTransactionWithMethod = await res.json()
  l('return %o', transaction)

  return transaction
}
