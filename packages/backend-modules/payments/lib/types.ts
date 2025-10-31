import { Branded } from '@orbiting/backend-modules-types'
import Stripe from 'stripe'

export type TypedData<K, T> = { type: K; data: T }

export type Company = 'PROJECT_R' | 'REPUBLIK'

export type Order = {
  id: string
  company: Company
  userId: string
  externalId: string
  subscriptionId: string
  invoiceId: string
  status: 'paid' | 'unpaid'
  metadata?: any
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
}

export type SubscriptionType =
  | 'YEARLY_SUBSCRIPTION'
  | 'BENEFACTOR_SUBSCRIPTION'
  | 'MONTHLY_SUBSCRIPTION'

export type SubscriptionStatus =
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'
  | 'active'
  | 'canceled'
  | 'unpaid'
  | 'past_due'

export const STATUS_TYPES: SubscriptionStatus[] = [
  'trialing',
  'incomplete',
  'incomplete_expired',
  'paused',
  'active',
  'canceled',
  'unpaid',
  'past_due',
]

export const ACTIVE_STATUS_TYPES: SubscriptionStatus[] = [
  'active',
  'past_due',
  'unpaid',
  'paused',
]

export const USER_VISIBLE_STATUS_TYPES: SubscriptionStatus[] = [
  'active',
  'past_due',
  'trialing',
  'unpaid',
  'paused',
  'canceled',
]

export const NOT_STARTED_STATUS_TYPES: SubscriptionStatus[] = [
  'trialing',
  'incomplete',
  'incomplete_expired',
]

export type Subscription = {
  id: string
  userId: string
  company: Company
  externalId: string
  hrId: string
  status: SubscriptionStatus
  type: SubscriptionType
  cancelAtPeriodEnd: boolean
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAt?: Date
  canceledAt?: Date
  endedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type SubscriptionArgs = {
  company: Company
  externalId: string
  status: SubscriptionStatus
  type?: SubscriptionType
  metadata: Record<string, string> | null
  cancelAtPeriodEnd?: boolean
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancellationComment?: string | null
  cancellationFeedback?: string | null
  cancellationReason?: string | null
  cancelAt?: Date | null
  canceledAt?: Date | null
  endedAt?: Date | null
}

export type RepublikAGSubscription = Subscription & {
  type: 'MONTHLY_SUBSCRIPTION'
  company: 'REPUBLIK_AG'
}

export type ProjectRYearlySubscription = Subscription & {
  type: 'YEARLY_SUBSCRIPTION'
  company: 'PROJECT_R'
}

export type InvoiceStatus = 'draft' | 'paid' | 'void' | 'refunded' | 'open'

export type Invoice = {
  id: string
  subscriptionId: string
  userId: string
  company: Company
  externalId: string
  metadata: Record<string, any>
  status: InvoiceStatus
  total: number
  totalBeforeDiscount: number
  totalDiscountAmount: number
  totalDiscountAmounts: any
  totalExcludingTax: number
  totalTaxAmounts: any
  totalTaxAmount: number
  discounts: string[]
  items: any
  periodStart: Date
  periodEnd: Date
  createdAt: Date
  updatedAt: Date
}

export type InvoiceArgs = {
  company: Company
  externalId: string
  discounts?: any
  metadata: Record<string, string> | null
  externalSubscriptionId?: string
  periodStart?: Date
  periodEnd?: Date
  status: InvoiceStatus
  total: number
  totalBeforeDiscount: number
  totalDiscountAmount: number
  totalDiscountAmounts: any
  totalExcludingTax: number
  totalTaxAmounts: any
  totalTaxAmount: number
  items: any
}

export type InvoiceRepoArgs = {
  company: Company
  externalId: string
  discounts?: any
  metadata: Record<string, string> | null
  subscriptionId?: string
  periodStart?: Date
  periodEnd?: Date
  status: InvoiceStatus
  total: number
  totalBeforeDiscount: number
  totalDiscountAmount: number
  totalDiscountAmounts: any
  totalExcludingTax: number
  totalTaxAmounts: any
  totalTaxAmount: number
  items: any
}

export type InvoiceUpdateArgs = {
  discounts?: any
  status: InvoiceStatus
  metadata?: Record<string, any>
  total?: number
  totalBeforeDiscount?: number
  items?: any
}

export type WebhookSource = 'stripe'

export type Webhook<T> = {
  id: string
  source: WebhookSource
  sourceId: string
  payload: T
  processed: boolean
  createdAt: string
  updatedAt: string
}

export type SelectCriteria =
  | { id: string; externalId?: never }
  | { externalId: string; id?: never }

export type SubscriptionUpdateArgs = {
  status?: SubscriptionStatus
  cancelAtPeriodEnd?: boolean
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  cancellationComment?: string | null
  cancellationFeedback?: string | null
  cancellationReason?: string | null
  endedAt?: Date | null
  canceledAt?: Date | null
  cancelAt?: Date | null
}

export type Address = {
  city: string | null
  country: string | null
  line1: string | null
  line2: string | null
  postal_code: string | null
  state: string | null
}

export type ChargeInsert = {
  company: Company
  externalId: string
  invoiceId: string | null
  paid: boolean
  status: 'succeeded' | 'pending' | 'failed'
  amount: number
  amountCaptured: number
  amountRefunded: number
  paymentMethodType: 'CARD' | 'TWINT' | 'PAYPAL' | null
  fullyRefunded: boolean
  createdAt: Date
  paymentIntentId: string
  customerId: string
  description?: string | null
  failureCode?: string | null
  failureMessage?: string | null
}

export type ChargeUpdate = {
  paid: boolean
  status: string
  amount: number
  amountCaptured: number
  amountRefunded: number
  fullyRefunded: boolean
}

export type Transaction = {
  id: string
  amount: number
  currency: string
  status: string
  subscriptionId?: string
  pledgeId?: string
}

export type PaymentMethod = {
  id: string
  method: string
  last4?: string
}

export interface PaymentWorkflow<T extends Stripe.Event> {
  run(company: Company, event: T): Promise<any>
}

export interface MailNotifier<T extends object> {
  sendEmail(recipient: string, args: T): Promise<any>
}

export type ValidOfferId = Branded<string, 'offerId'>
export type ValidSubscriptionOfferId = Branded<string, 'subscriptionOfferId'>

export type OfferId = ValidOfferId | ValidSubscriptionOfferId

export type OfferType = 'SUBSCRIPTION' | 'ONETIME_PAYMENT'
export type OfferAvailability =
  | 'PURCHASABLE'
  | 'UPGRADEABLE'
  | 'UNAVAILABLE'
  | 'UNAVAILABLE_CURRENT'
  | 'UNAVAILABLE_UPGRADE_PENDING'

export type PriceDefinition = {
  type: 'PRICE'
  lookupKey: string
  taxRateId?: string
}
export type DiscountDefinition = { type: 'DISCOUNT'; coupon: string }

export type ComplimentaryItem = {
  id: string
  maxQuantity: number
  lookupKey: string
}

export type PriceInfo = {
  amount: number
  currency: string
  recurring?: {
    interval: 'year' | 'month'
    intervalCount: number
  }
}

export type ComplimentaryItemOrder = {
  id: string
  quantity: number
}

export type BaseOffer = {
  id: OfferId
  company: Company
  name: string
  type: OfferType
  items: PriceDefinition[]
  complimentaryItems?: ComplimentaryItem[]
  discountOptions?: DiscountDefinition[]
  suggestedDonations?: number[]
  fixedDiscount?: string
  requiresLogin: boolean
  requiresAddress: boolean
  allowPromotions: boolean
  metaData?: {
    [name: string]: string | number | null
  }
  taxRateId?: string
}

export type SubscriptionOffer = BaseOffer & {
  type: 'SUBSCRIPTION'
  subscriptionType: SubscriptionType
}

export type OneTimeOffer = BaseOffer & {
  type: 'ONETIME_PAYMENT'
}

export type Offer = SubscriptionOffer | OneTimeOffer

export type OfferAPIResult = {
  id: string
  company: Company
  name: string
  availability: OfferAvailability
  startDate?: Date
  requiresLogin: boolean
  price: {
    amount: number
    currency: string
    recurring?: {
      interval: 'year' | 'month'
      intervalCount: number
    }
  }
  suggestedDonations?: number[]
  discount?: APIDiscountResult
}

export interface APIDiscountResult {
  id?: string
  name: string
  amountOff: number
  duration: 'forever' | 'once' | 'repeating'
  durationInMonths: number | null
  currency: string
}

export type Discount = {
  id: string
  type: 'DISCOUNT'
  name: string
  amountOff: number
  duration: 'forever' | 'once' | 'repeating'
  durationInMonths: number | null
  currency: string
}

export type Promotion = {
  id: string
  type: 'PROMO'
  name: string
  amountOff: number
  duration: 'forever' | 'once' | 'repeating'
  durationInMonths: number | null
  currency: string
}

export type DiscountOption =
  | { type: 'DISCOUNT'; value: Discount }
  | { type: 'PROMO'; value: Promotion }
