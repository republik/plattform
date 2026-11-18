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
  createdAt: Date
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
  createdAt: Date
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
  organization?: string
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

  periods.forEach((period) => {
    period.membership = memberships.find((m) => m.id === period.membershipId)
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

  packageOptions.forEach((packageOption) => {
    packageOption.reward = rewards.find(
      (r) => r.rewardId === packageOption.rewardId,
    )
  })

  pledgeOptions.forEach((pledgeOption) => {
    pledgeOption.option = packageOptions.find(
      (o) => o.id === pledgeOption.templateId,
    )

    pledgeOption.period = periods.find(
      (p) =>
        p.membershipId === pledgeOption.membershipId &&
        // Find the period which was created within 1 hour of the payment
        p.createdAt.getTime() >= payment?.createdAt.getTime() &&
        p.createdAt.getTime() <= payment?.createdAt.getTime() + 60 * 60 * 1000,
    )
  })

  const pledge: Pledge =
    pledgePayment?.pledgeId &&
    (await pgdb.public.pledges.findOne({ id: pledgePayment.pledgeId }))

  // Filter out pledge options for goodies that don't fall within 1 hour of the payment
  pledge.options = pledgeOptions.filter((pledgeOption) => {
    if (pledgeOption.option?.reward?.rewardType === 'Goodie') {
      const isWithinHour =
        pledgeOption.createdAt.getTime() >=
          payment?.createdAt.getTime() - 60 * 60 * 1000 &&
        pledgeOption.createdAt.getTime() <=
          payment?.createdAt.getTime() + 60 * 60 * 1000
      if (!isWithinHour) {
        return false
      }
    }
    return true
  })

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

// Country is free text in the addresses table ("Schweiz", "CH", "sweden",
// "Suisse", "BRD", ...). Resolve it to an ISO 3166-1 alpha-2 code via the
// country names Intl knows in the languages our users enter, plus a few
// aliases.
const COUNTRY_LOCALES = ['de', 'en', 'fr', 'it']
const COUNTRY_ALIASES: Record<string, string> = {
  brd: 'DE',
  bundesrepublik: 'DE',
  usa: 'US',
  uk: 'GB',
  england: 'GB',
}

// Deprecated codes Intl still names (e.g. FX = "Metropolitan France" would
// otherwise shadow FR)
const DEPRECATED_COUNTRY_CODES = new Set([
  'AN',
  'BU',
  'CS',
  'DD',
  'FX',
  'NT',
  'SU',
  'TP',
  'YD',
  'YU',
  'ZR',
])

let countryCodeByName: Map<string, string> | undefined

function getCountryCodeByName(): Map<string, string> {
  if (countryCodeByName) {
    return countryCodeByName
  }

  const map = new Map<string, string>()
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

  for (const locale of COUNTRY_LOCALES) {
    const names = new Intl.DisplayNames([locale], { type: 'region' })

    for (const a of letters) {
      for (const b of letters) {
        const code = `${a}${b}`
        const name = names.of(code)

        if (name && name !== code && !DEPRECATED_COUNTRY_CODES.has(code)) {
          for (const key of [name.toLowerCase(), code.toLowerCase()]) {
            if (!map.has(key)) {
              map.set(key, code)
            }
          }
        }
      }
    }
  }

  countryCodeByName = map
  return map
}

function getCountryCode(string: string | undefined): string {
  const name = (string || '').normalize('NFKC').trim().toLowerCase()

  if (!name) {
    return 'CH'
  }

  const code = COUNTRY_ALIASES[name] || getCountryCodeByName().get(name)

  if (!code) {
    throw new Error(`Unknown country: ${string}`)
  }

  return code
}

// Swiss QR bills accept structured addresses only (address type "S"):
// street and building number are separate fields. A trailing number
// ("12", "12a", "5bis", "12-14") is the building number, everything before
// it is the street. swissqrbill falls back to the unstructured type "K"
// if buildingNumber is undefined, so an empty string is returned if there
// is no number (e.g. "Hauptstrasse").
const BUILDING_NUMBER_REGEX =
  /^(.+?)[\s,]+(\d+[a-z]{0,3}(?:\s?[-/]\s?\d+[a-z]{0,3})?)$/i

export function splitStreet(line1: string): {
  address: string
  buildingNumber: string
} {
  const value = line1.trim().replace(/\s+/g, ' ')
  const [, address, buildingNumber] = value.match(BUILDING_NUMBER_REGEX) || []

  if (!address) {
    return { address: value, buildingNumber: '' }
  }

  return { address, buildingNumber }
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
      ...splitStreet(creditorAddress.line1),
      zip: creditorAddress.postalCode,
      city: creditorAddress.city,
      country: getCountryCode(creditorAddress.country),
    },
    ...(debtorAddress && {
      debtor: {
        name: debtorAddress.organization
          ? `${debtorAddress.organization}, ${debtorAddress.name}`
          : debtorAddress.name,
        ...splitStreet(debtorAddress.line1),
        zip: debtorAddress.postalCode,
        city: debtorAddress.city,
        country: getCountryCode(debtorAddress.country),
      },
    }),
  }
}
