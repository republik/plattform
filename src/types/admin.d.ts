export interface Testimonial {
  id: string
  name: string
  role?: string
  quote?: string
  video?: any // Video
  image?: string
  smImage?: string
  published: boolean
  adminUnpublished: boolean
  sequenceNumber: number
}
export interface Address {
  name?: string
  line1: string
  line2?: string
  postalCode: string
  city: string
  country: string
}

export interface User {
  id: string
  name: string
  email: string
  username: string
  firstName: string
  lastName: string
  address?: Address
  birthDate?: string
  phoneNumber?: string
  createdAt: string
  updatedAt: string
  statement?: string
  portrait?: string
  pledges: Pledge[]
  memberships: Membership[]
  roles: string[]
}

export interface Goodie {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

export type Reward = Goodie | MembershipType

export type PledgeStatus =
  | 'DRAFT'
  | 'WAITING_FOR_PAYMENT'
  | 'PAID_INVESTIGATE'
  | 'SUCCESSFUL'
  | 'CANCELLED'

export type PaymentStatus =
  | 'WAITING'
  | 'WAITING_FOR_REFUND'
  | 'PAID'
  | 'REFUNDED'
  | 'CANCELLED'

export type PaymentMethod =
  | 'STRIPE'
  | 'POSTFINANCECARD'
  | 'PAYPAL'
  | 'PAYMENTSLIP'

export interface PackageOption {
  id: string
  package: Package
  reward?: Reward
  minAmount: number
  maxAmount?: number
  defaultAmount: number
  price: number
  minUserPrice: number
  userPrice: boolean
  createdAt: string
  updatedAt: string
  amount?: number
  templateId?: string
}

export interface Package {
  id: string
  name: string
  options: PackageOption[]
  createdAt: string
  updatedAt: string
}

export interface Pledge {
  id: string
  package: Package
  options: PackageOption[]
  status: PledgeStatus
  total: number
  donation: number
  payments: PledgePayment[]
  user: User
  reason: string
  memberships: Membership[]
  createdAt: string
  updatedAt: string
}

export interface PledgePayment {
  id: string
  method: PaymentMethod
  paperInvoice: boolean
  total: number
  status: PaymentStatus
  remindersSentAt: string[]
  hrid: string
  pspId?: any
  user: User
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export interface MembershipPeriod {
  beginDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

export interface MembershipType {
  id: string
  name: string
  duration: number
  createdAt: string
  updatedAt: string
}

export interface Membership {
  id: string
  type: MembershipType
  startDate: string
  pledge: any
  cancelReasons: string[]
  renew: Boolean
  voucherCode: string
  reducedPrice: boolean
  claimerName: string
  sequenceNumber: number
  createdAt: string
  updatedAt: string
  periods: MembershipPeriod[]
}

export interface PostfinancePayment {
  id: string
  hidden: boolean
  buchungsdatum: string
  valuta: string
  avisierungstext: string
  gutschrift: number
  mitteilung?: string
  matched: boolean
  createdAt: string
  updatedAt: string
}
