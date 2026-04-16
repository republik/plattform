import PDFDocument from 'pdfkit'
import { SwissQRBill } from 'swissqrbill/pdf'

import {
  GenerateFn,
  getSwissQrBillData,
  IsApplicableFn,
  PaymentMethod,
  PaymentStatus,
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
      const doc = new PDFDocument({ size: 'A4' })

      const qrBill = new SwissQRBill(data)
      qrBill.attachTo(doc)
      doc.end()

      const buffers: Buffer[] = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      doc.on('error', () => reject())
    } catch (e) {
      reject(e)
    }
  })
}
