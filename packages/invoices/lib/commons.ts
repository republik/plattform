import {
  generate as generateReference,
  validate as validateReference,
} from 'node-iso11649'

import { Context } from '@orbiting/backend-modules-types'

interface PaymentIdInput {
  id: string
}

interface PaymentHridInput {
  hrid: string
}

export interface PaymentResolved extends Payment {
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

export async function resolvePayment(
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

export function getCountryCode(string: string): string {
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

export function getReference(hrid: string, pretty?: boolean): string {
  if (!hrid) {
    throw new Error('hrid is missing')
  }

  return generateReference({
    reference: `HRID${hrid}`,
    pretty,
  })
}

export function getHrId(string: string): string | null {
  const [reference, hrid] =
    string
      .replace(/[^A-Za-z0-9]/g, '')
      .match(/RF\d\d0{0,11}HRID([A-Za-z0-9]{6})/) || []

  if (!reference) {
    return null
  }

  if (!validateReference(reference)) {
    return null
  }

  return hrid
}
