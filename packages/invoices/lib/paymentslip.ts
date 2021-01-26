import { PDF, data as BillData } from 'swissqrbill'

import {
  PaymentResolved,
  PaymentMethod,
  PaymentStatus,
  getReference,
  getCountryCode,
} from './commons'

export function isApplicable(payment: PaymentResolved): boolean {
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

function getSwissQrBillData(payment: PaymentResolved): BillData {
  if (!payment.hrid) {
    throw new Error('Payment HR-ID missing')
  }

  const account = payment?.pledge?.package?.bankAccount?.iban

  if (!account) {
    throw new Error('Creditor IBAN missing')
  }

  const creditorAddress = payment?.pledge?.package?.bankAccount?.address

  if (!creditorAddress) {
    throw new Error('Creditor address missing')
  }

  if (!Number(creditorAddress.postalCode)) {
    throw new Error('Creditor address postal code is not a number')
  }

  const debtorAddress = payment?.pledge?.user?.address

  return {
    currency: 'CHF',
    amount: payment.total / 100,
    reference: getReference(payment.hrid),
    creditor: {
      account,
      name: creditorAddress.name,
      address: creditorAddress.line1,
      zip: Number(creditorAddress.postalCode),
      city: creditorAddress.city,
      country: getCountryCode(creditorAddress.country),
    },
    ...(debtorAddress &&
      Number(debtorAddress.postalCode) && {
        debtor: {
          name: debtorAddress.name,
          address: debtorAddress.line1,
          zip: Number(debtorAddress.postalCode),
          city: debtorAddress.city,
          country: getCountryCode(creditorAddress.country),
        },
      }),
  }
}

export async function generate(payment: PaymentResolved): Promise<Buffer> {
  const data = await getSwissQrBillData(payment)

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
