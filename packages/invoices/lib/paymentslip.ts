import { PDF } from 'swissqrbill'

import {
  PaymentResolved,
  PaymentMethod,
  PaymentStatus,
  getSwissQrBillData,
  IsApplicableFn,
  GenerateFn,
} from './commons'

export const isApplicable: IsApplicableFn = function (payment) {
  if (!payment.id) {
    return false
  }

  if (payment.method !== PaymentMethod.PAYMENTSLIP) {
    return false
  }

  if (payment.status !== PaymentStatus.WAITING) {
    return false
  }

  return true
}

export const generate: GenerateFn = function (payment) {
  const data = getSwissQrBillData(payment)

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDF(data, '/dev/null')

      const buffers: Buffer[] = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      doc.on('error', () => reject())
    } catch (e) {
      reject(e)
    }
  })
}
