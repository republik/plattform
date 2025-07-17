import Stripe from 'stripe'

export type Company = 'PROJECT_R' | 'REPUBLIK'

export type Order = {
  id: string
  company: Company
  userId: string
  externalId: string
  subscriptionId: string
  invoiceId: string
  status: 'paid' | 'unpaid'
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
  invoiceId: string
  paid: boolean
  status: string
  amount: number
  amountCaptured: number
  amountRefunded: number
  paymentMethodType: 'CARD' | 'TWINT' | 'PAYPAL' | null
  fullyRefunded: boolean
  createdAt: Date
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
