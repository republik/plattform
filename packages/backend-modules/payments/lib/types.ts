export type Company = 'PROJECT_R' | 'REPUBLIK_AG'

export type PaymentGateway = 'STRIPE_PROJECT_R' | 'STRIPE_REPUBLIK_AG'

export type Order = {
  id: string
  userId: string
  items: any
  total: number
  totalBeforeDiscount: number
  discountTotal: number
  discountCode: string
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
  | 'ended'

export type Subscription = {
  id: string
  userId: string
  company: Company
  gatewayId: string
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
  gatewayId: string
  status: SubscriptionStatus
  type?: SubscriptionType
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
  gatewayId: string
  status: 'paid' | 'void' | 'refunded'
  price: number
  periodStart: Date
  periodEnd: Date
  createdAt: Date
  updatedAt: Date
}

export type InvoiceArgs = {
  company: Company
  gatewayId: string
  discounts?: any
  subscriptionId?: string
  status: 'draft' | 'paid' | 'void' | 'refunded'
  total: number
  totalBeforeDiscount: number
  items: any
}

export type InvoiceUpdateArgs = {
  discounts?: any
  status: 'draft' | 'paid' | 'void' | 'refunded'
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
  | { id: string; gatewayId?: never }
  | { gatewayId: string; id?: never }

export type SubscriptionUpdateArgs = {
  status?: SubscriptionStatus
  cancelAtPeriodEnd?: boolean
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  endedAt?: Date
  canceledAt?: Date
  cancelAt?: Date | null
}
