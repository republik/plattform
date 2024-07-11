export type Company = 'project_r' | 'republik_ag'

export type PaymentGateway = 'stripe_project_r' | 'stripe_republik_ag'

export type Order = {
  id: string
  userId: string
  items: Record<string, any>
  total: number
  payment_status: 'paid' | 'unpaid'
  createdAt: Date
  updatedAt: Date
}

export type SubscriptionKind = 'project_r_yearly' | 'republik_ag_mothly'

export type Subscription = {
  id: string
  userId: string
  company: Company
  gatewayId: string
  hrId: string
  status: string
  kind: SubscriptionKind
  cancel_at_period_end: boolean
  current_period_start: Date
  current_period_end: Date
  cancel_at: Date
  canceled_at: Date
  endedAt?: Date
  createdAt: Date
  updatedAt: Date
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
  createdAt: string
}
