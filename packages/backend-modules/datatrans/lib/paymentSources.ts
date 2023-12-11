import { ConnectionContext } from '@orbiting/backend-modules-types'
import { DatatransTransactionWithMethod } from './types'

type PaymentSourceRow = {
  id: string
  method: 'DATATRANS'
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
      { userId },
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
    method: 'DATATRANS',
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
