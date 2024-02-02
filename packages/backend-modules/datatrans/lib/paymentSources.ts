import { ConnectionContext } from '@orbiting/backend-modules-types'
import { DatatransPaymentMethod, DatatransTransactionWithMethod } from './types'
import {
  getAliasString,
  getMerchant,
  getTransaction,
  isPreAuthorized,
} from './helpers'

type PaymentSourceRow = {
  id: string
  method: DatatransPaymentMethod
  userId: string
  pspId: string
  pspPayload: DatatransTransactionWithMethod
  createdAt: Date
  updatedAt: Date
  companyId: string
}

export const getDefaultPaymentSource = async (
  userId: string,
  pgdb: ConnectionContext['pgdb'],
) => {
  const [paymentSource] = <PaymentSourceRow[]>(
    await pgdb.public.paymentSources.find(
      { userId, 'pspId !=': null },
      { orderBy: { createdAt: 'desc' }, limit: 1 },
    )
  )

  if (paymentSource) {
    return paymentSource
  }
}

export const normalizePaymentSource = (row: any) => {
  const { id } = row

  const details =
    row.pspPayload?.[row.pspPayload?.paymentMethod] || row.pspPayload?.card

  return {
    id,
    method: row.method,
    isDefault: true,
    status: 'CHARGEABLE',
    brand: details?.info?.brand || row.pspPayload?.paymentMethod || 'n/a',
    wallet: null,
    last4: details?.masked?.slice(-4),
    expMonth: details?.expiryMonth,
    expYear: details?.expiryYear,
    isExpired: false,
  }
}

export const addPaymentSource = async (
  sourceId: string,
  userId: string,
  pgdb: ConnectionContext['pgdb'],
) => {
  const paymentSource = await pgdb.public.paymentSources.findOne({
    id: sourceId,
    userId,
  })

  if (!paymentSource) {
    throw new Error('sourceId not found')
  }

  if (paymentSource.pspId) {
    throw new Error('unable to add paymentSource (added already)')
  }

  const transactionId = paymentSource.pspPayload.transactionId
  if (!transactionId) {
    throw new Error('transactionId not available')
  }

  const transaction = await getTransaction(
    getMerchant(paymentSource.companyId),
    transactionId,
  )
  if (!isPreAuthorized(transaction)) {
    throw new Error('transaction seems not pre-authorized')
  }

  await pgdb.public.paymentSources.updateOne(
    { id: sourceId },
    {
      pspId: getAliasString(transaction),
      pspPayload: transaction,
      updatedAt: new Date(),
    },
  )
}
