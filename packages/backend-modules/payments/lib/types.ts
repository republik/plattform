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

export type Subscription = {
  id: string
  userId: string
  company: Company
  gatewayId: string
  hrId: string
  status: string
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
  gateway: PaymentGateway
  gatewayId: string
  status: 'paid' | 'void' | 'refunded'
  price: number
  periodStart: Date
  periodEnd: Date
  createdAt: Date
  updatedAt: Date
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
