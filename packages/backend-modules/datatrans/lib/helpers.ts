type DatatransBody = {
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
enum DatatransPaymentMethod {
  MasterCard = 'ECA',
  Visa = 'VIS',
  AmericanExpress = 'AMX',
  ApplePay = 'APL',
  GooglePay = 'PAY',
  PostfinanceCard = 'PFC',
  PayPal = 'PAP',
  Twint = 'TWI',
}

export enum DatatransService {
  CREDITCARD = 'CREDITCARD',
  POSTFINANCE = 'POSTFINANCE',
  PAYPAL = 'PAYPAL',
  TWINT = 'TWINT',
}

type InitTransactionProps = {
  refno: number
  amount: number
  service: DatatransService
  createAlias: boolean
}

const SERVICE_INIT_BODY: Record<
  InitTransactionProps['service'],
  (props: InitTransactionProps) => DatatransBody
> = {
  CREDITCARD: (props) => ({
    amount: props.amount,
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
    amount: props.amount,
    paymentMethods: [DatatransPaymentMethod.PostfinanceCard],
    option: {
      createAlias: true,
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

export const initTransaction = async (
  props: InitTransactionProps,
): Promise<{ authorizeUrl: string }> => {
  const { refno, amount, service } = props

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
    ...SERVICE_INIT_BODY[service](props),
    currency: 'CHF',
    autoSettle: false,
    refno,
    redirect: {
      successUrl: successUrl.toString(),
      errorUrl: errorUrl.toString(),
      cancelUrl: cancelUrl.toString(),
    },
  })

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
  )

  console.log({ authorizeUrl })

  return {
    authorizeUrl: authorizeUrl.toString(),
  }
}

export const getTransaction = async (datatransTrxId: string) => {
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

  return await res.json()
}

export const isPreAuthorized = (datatransTrx: any) =>
  datatransTrx.type === 'card_check' && datatransTrx.status === 'authorized'

type SettleTransactionProps = {
  datatransTrxId: string
  refno: string
  amount: number
}

export const settleTransaction = async (props: SettleTransactionProps) => {
  const { datatransTrxId, refno, amount } = props

  const res = await fetch(
    `https://api.sandbox.datatrans.com/v1/transactions/${datatransTrxId}/settle`,
    {
      method: 'POST',
      headers: {
        Authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'CHF',
        refno,
      }),
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

  return true
}

type TransactionPaymentMethodProps =
  | { card: { alias: string; expiryMonth: number; expiryYear: number } }
  | { PFC: { alias: string } }
  | { PAP: { alias: string } }
  | { TWI: { alias: string } }

type AuthorizeAndSettleTransactionProps = {
  refno: string
  amount: number
  alias: TransactionPaymentMethodProps
}

const pickAliasProps = (paymentMethodProps: TransactionPaymentMethodProps) => {
  if ('card' in paymentMethodProps) {
    const { card } = paymentMethodProps
    return {
      card: {
        alias: card.alias,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
      },
    }
  }

  if ('PFC' in paymentMethodProps) {
    return { PFC: { alias: paymentMethodProps.PFC.alias } }
  }

  if ('PAP' in paymentMethodProps) {
    return { PAP: { alias: paymentMethodProps.PAP.alias } }
  }

  if ('TWI' in paymentMethodProps) {
    return { TWI: { alias: paymentMethodProps.TWI.alias } }
  }

  throw new Error('Unable to pick alias props')
}

export const authorizeAndSettleTransaction = async (
  props: AuthorizeAndSettleTransactionProps,
) => {
  const { refno, amount, alias } = props

  const res = await fetch(
    `https://api.sandbox.datatrans.com/v1/transactions/authorize`,
    {
      method: 'POST',
      headers: {
        Authorization,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'CHF',
        refno,
        autoSettle: true,
        ...pickAliasProps(alias),
      }),
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

  return await res.json()
}
