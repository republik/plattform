import { types } from 'swissqrbill'
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
  pledge: Pledge
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
  createdAt: Date
}

interface PledgePayment {
  pledgeId: string
  pledge: Pledge
}

interface Pledge {
  id: string
  packageId: string
  package: Package
  userId: string
  user: User
  options: PledgeOption[]
  donation: number
  total: number
}

export interface PledgeOption {
  id: string
  templateId: string
  membershipId: string
  amount: number
  price: number
  periods: number
  option?: PackageOption
  period?: Period
}

interface PackageOption {
  id: string
  rewardId?: string
  reward?: Reward
}

interface Reward {
  rewardId: string
  rewardType: string
  name: string
  interval: string
}

interface Period {
  id: string
  membershipId: string
  membership?: Membership
  beginDate: Date
  endDate: Date
}

interface Membership {
  id: string
  sequenceNumber: number
}

interface Package {
  companyId: string
  company: Company
  bankAccount?: BankAccount
}

interface Company {
  id: string
  name: string
}

interface BankAccount {
  iban: string
  addressId?: string
  address?: Address
  image?: Buffer
  canInvoice: boolean
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  addressId?: string
  address?: Address
}

export interface Address {
  id: string
  name: string
  line1: string
  line2?: string
  postalCode: string
  city: string
  country: string
}

export interface IsApplicableFn {
  (payment: PaymentResolved): boolean
}

export interface GenerateFn {
  (payment: PaymentResolved, context?: Context): Promise<Buffer>
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

  const periods: Period[] =
    pledgePayment?.pledgeId &&
    (await pgdb.public.membershipPeriods.find({
      pledgeId: pledgePayment.pledgeId,
    }))

  const memberships: Membership[] =
    (periods.length &&
      (await pgdb.public.memberships.find({
        id: periods.map((p) => p.membershipId),
      }))) ||
    []

  periods.forEach((period, index, periods) => {
    periods[index].membership = memberships.find(
      (m) => m.id === period.membershipId,
    )
  })

  const pledgeOptions: PledgeOption[] =
    (pledgePayment?.pledgeId &&
      (await pgdb.public.pledgeOptions.find(
        {
          pledgeId: pledgePayment.pledgeId,
          'amount >': 0,
        },
        {
          orderBy: {
            amount: 'desc',
          },
        },
      ))) ||
    []

  const packageOptions: PackageOption[] =
    (pledgeOptions.length &&
      (await pgdb.public.packageOptions.find({
        id: pledgeOptions.map((o) => o.templateId),
      }))) ||
    []

  const rewardGoodies: Reward[] =
    (pledgeOptions.length &&
      (await pgdb.public.goodies.find({
        rewardId: packageOptions.map((o) => o.rewardId),
      }))) ||
    []

  const rewardMembershipTypes: Reward[] =
    (pledgeOptions.length &&
      (await pgdb.public.membershipTypes.find({
        rewardId: packageOptions.map((o) => o.rewardId),
      }))) ||
    []

  const rewards: Reward[] = [...rewardGoodies, ...rewardMembershipTypes]

  packageOptions.forEach((packageOption, index, packageOptions) => {
    packageOptions[index].reward = rewards.find(
      (r) => r.rewardId === packageOption.rewardId,
    )
  })

  pledgeOptions.forEach((pledgeOption, index, pledgeOptions) => {
    pledgeOptions[index].option = packageOptions.find(
      (o) => o.id === pledgeOption.templateId,
    )

    pledgeOptions[index].period = periods.find(
      (p) => p.membershipId === pledgeOption.membershipId,
    )
  })

  const pledge: Pledge =
    pledgePayment?.pledgeId &&
    (await pgdb.public.pledges.findOne({ id: pledgePayment.pledgeId }))

  pledge.options = pledgeOptions

  const pkg: Package =
    pledge?.packageId &&
    (await pgdb.public.packages.findOne({ id: pledge.packageId }))

  const company: Company =
    pkg?.companyId &&
    (await pgdb.public.companies.findOne({ id: pkg.companyId }))

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
        company,
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

function getCountryCode(string: string): string {
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
    reference: `HRID${hrid.toUpperCase()}`,
    pretty,
  })
}

export function getHrId(string: string): string | null {
  const [reference, hrid] =
    string
      .replace(/[^A-Z0-9]/gi, '')
      .match(/RF\d\d0{0,11}HRID([A-Z0-9]{6})/i) || []

  if (!reference) {
    return null
  }

  if (!validateReference(reference)) {
    return null
  }

  return hrid.toUpperCase()
}

export function getSwissQrBillData(payment: PaymentResolved): types.Data {
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

  const debtorAddress = payment?.pledge?.user?.address

  return {
    currency: 'CHF',
    amount: payment.total / 100,
    reference: getReference(payment.hrid),
    creditor: {
      account,
      name: creditorAddress.name,
      address: creditorAddress.line1,
      zip: creditorAddress.postalCode,
      city: creditorAddress.city,
      country: getCountryCode(creditorAddress.country),
    },
    ...(debtorAddress && {
      debtor: {
        name: debtorAddress.name,
        address: debtorAddress.line1,
        zip: debtorAddress.postalCode,
        city: debtorAddress.city,
        country: getCountryCode(creditorAddress.country),
      },
    }),
  }
}
