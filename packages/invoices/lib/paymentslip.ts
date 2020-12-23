import { PDF, data as BillData } from 'swissqrbill'
import { generate as generateReference } from 'node-iso11649'

import { Context } from '@orbiting/backend-modules-types'

interface PaymentIdInput {
  id: string
}
interface PaymentHridInput {
  hrid: string
}
interface PaymentResolved extends Payment {
  pledge?: Pledge
}

export enum PaymentMethod {
  STRIPE = 'STRIPE',
  POSTFINANCECARD = 'POSTFINANCECARD',
  PAYPAL = 'PAYPAL',
  PAYMENTSLIP = 'PAYMENTSLIP',
}

export enum PaymentStatus {
  WAITING = 'WAITING',
  PAID = 'PAID',
  WAITING_FOR_REFUND = 'WAITING_FOR_REFUND',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}
interface Payment {
  id: string
  hrid: string
  method: PaymentMethod
  status: PaymentStatus
  total: number
}
interface PledgePayment {
  pledgeId: string
  pledge?: Pledge
}

interface Pledge {
  packageId: string
  package: Package
  userId: string
  user: User
}

interface Package {
  companyId: string
  bankAccount?: BankAccount
}

interface BankAccount {
  iban: string
  addressId?: string
  address?: Address
}
interface User {
  id: string
  addressId?: string
  address?: Address
}

interface Address {
  id: string
  name: string
  line1: string
  line2?: string
  postalCode: string
  city: string
  country: string
}

export async function resolve(
  input: PaymentIdInput | PaymentHridInput,
  context: Context,
): Promise<PaymentResolved> {
  const { pgdb } = context

  const payment: Payment = await pgdb.public.payments.findOne(input)

  const pledgePayment: PledgePayment =
    payment?.id &&
    (await pgdb.public.pledgePayments.findOne({ paymentId: payment.id }))

  const pledge: Pledge =
    pledgePayment?.pledgeId &&
    (await pgdb.public.pledges.findOne({ id: pledgePayment.pledgeId }))

  const pkg: Package =
    pledge?.packageId &&
    (await pgdb.public.packages.findOne({ id: pledge.packageId }))

  const bankAccount: BankAccount =
    pkg?.companyId &&
    (await pgdb.public.bankAccounts.findOne({
      companyId: pkg.companyId,
      default: true,
    }))

  const bankAccountAddress: Address =
    bankAccount?.addressId &&
    (await pgdb.public.addresses.findOne({ id: bankAccount.addressId }))

  const user: User =
    pledge?.userId && (await pgdb.public.users.findOne({ id: pledge.userId }))

  const userAddress: Address =
    user?.addressId &&
    (await pgdb.public.addresses.findOne({ id: user.addressId }))

  return {
    ...payment,
    pledge: {
      ...pledge,
      package: {
        ...pkg,
        bankAccount: {
          ...bankAccount,
          address: bankAccountAddress,
        },
      },
      user: {
        ...user,
        address: userAddress,
      },
    },
  }
}

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

function toCountryCode(string: string): string {
  switch (string.trim().toLowerCase()) {
    case 'deutschland':
      return 'DE'
    case 'frankreich':
      return 'FR'
    case 'italia':
    case 'italien':
      return 'IT'
    case 'liechtenstein':
      return 'LI'
    case 'niederlande':
      return 'NL'
    case 'österreich':
      return 'AT'
    case 'spanien':
      return 'ES'
    case 'usa':
      return 'US'
    default:
      return 'CH'
  }
}

function toSwissQrBillData(payment: PaymentResolved): BillData {
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
    reference: toReference(`HRID${payment.hrid}`),
    message: `HR-ID: ${payment.hrid} (via QR)`,
    creditor: {
      account,
      name: creditorAddress.name,
      address: creditorAddress.line1,
      zip: Number(creditorAddress.postalCode),
      city: creditorAddress.city,
      country: toCountryCode(creditorAddress.country),
    },
    ...(debtorAddress &&
      Number(debtorAddress.postalCode) && {
        debtor: {
          name: debtorAddress.name,
          address: debtorAddress.line1,
          zip: Number(debtorAddress.postalCode),
          city: debtorAddress.city,
          country: toCountryCode(creditorAddress.country),
        },
      }),
  }
}

export function toReference(hrid: string, pretty?: boolean): string {
  if (!hrid) {
    throw new Error('hrid is missing')
  }

  return generateReference({
    reference: `HRID${hrid}`,
    pretty
  })
}

export async function generate(payment: PaymentResolved): Promise<Buffer> {
  const data = await toSwissQrBillData(payment)

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
