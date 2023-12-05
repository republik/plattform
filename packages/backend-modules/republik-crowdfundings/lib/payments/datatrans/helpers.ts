type InitTransactionProps = {
  refno: number
  amount: number
}

export const initTransaction = async (
  props: InitTransactionProps,
): Promise<string> => {
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
      amount,
      autoSettle: false,
      option: {
        createAlias: true,
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
          statusText: await res.text(),
        }),
    )
  }

  const transaction = await res.json()

  return transaction.transactionId
}
