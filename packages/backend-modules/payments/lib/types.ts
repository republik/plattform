export type Company = 'PROJECT_R' | 'REPUBLIK'

export type Order = {
  id: string
  userId: string
  items: any
  total: number
  totalBeforeDiscount: number
  discountTotal?: number
  discountCode?: string
  paymentStatus: 'paid' | 'unpaid'
  createdAt: Date
  updatedAt: Date
}

export type SubscriptionType = 'YEARLY_SUBSCRIPTION' | 'MONTHLY_SUBSCRIPTION'

export type SubscriptionStatus =
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused'
  | 'active'
  | 'canceled'
  | 'unpaid'
  | 'past_due'

export const ACTIVE_STATUS_TYPES: SubscriptionStatus[] = [
  'active',
  'past_due',
  'unpaid',
  'paused',
]

export const NOT_STARTED_STATUS_TYPES: SubscriptionStatus[] = [
  'trialing',
  'incomplete',
  'incomplete_expired'
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

export type Invoice = {
  id: string
  subscriptionId: string
  company: Company
  externalId: string
  metadata: Record<string, any>
  status: 'paid' | 'void' | 'refunded'
  price: number
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
  status: 'draft' | 'paid' | 'void' | 'refunded'
  total: number
  totalBeforeDiscount: number
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
  status: 'draft' | 'paid' | 'void' | 'refunded'
  total: number
  totalBeforeDiscount: number
  items: any
}

export type InvoiceUpdateArgs = {
  discounts?: any
  status: 'draft' | 'paid' | 'void' | 'refunded'
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

export type PaymentItemLocator =
  | { id: string; externalId?: never }
  | { externalId: string; id?: never }

export type SubscriptionUpdateArgs = {
  status?: SubscriptionStatus
  cancelAtPeriodEnd?: boolean
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  endedAt?: Date | null
  canceledAt?: Date | null
  cancelAt?: Date | null
}
