type InitTransactionProps = {
  refno: number
  amount: number
  preAuthorize?: boolean
}

export const initTransaction = async (
  props: InitTransactionProps,
): Promise<string> => {
  const { refno, amount, preAuthorize } = props

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

  const res = await fetch('https://api.sandbox.datatrans.com/v1/transactions', {
    method: 'POST',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(
          process.env.DATATRANS_MERCHANT_ID +
            ':' +
            process.env.DATATRANS_MERCHANT_PASSWORD,
        ).toString('base64'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      currency: 'CHF',
      refno,
      amount: preAuthorize ? 0 : amount,
      autoSettle: false,
      option: {
        createAlias: !!preAuthorize, // @TODO: creatAlias would always work but PayPal & Twint
      },
      redirect: {
        successUrl: successUrl.toString(),
        errorUrl: errorUrl.toString(),
        cancelUrl: cancelUrl.toString(),
      },
    }),
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

  return transaction.transactionId
}

export const getTransaction = async (datatransTrxId: string) => {
  const res = await fetch(
    `https://api.sandbox.datatrans.com/v1/transactions/${datatransTrxId}`,
    {
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(
            process.env.DATATRANS_MERCHANT_ID +
              ':' +
              process.env.DATATRANS_MERCHANT_PASSWORD,
          ).toString('base64'),
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
        Authorization:
          'Basic ' +
          Buffer.from(
            process.env.DATATRANS_MERCHANT_ID +
              ':' +
              process.env.DATATRANS_MERCHANT_PASSWORD,
          ).toString('base64'),
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
        Authorization:
          'Basic ' +
          Buffer.from(
            process.env.DATATRANS_MERCHANT_ID +
              ':' +
              process.env.DATATRANS_MERCHANT_PASSWORD,
          ).toString('base64'),
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
