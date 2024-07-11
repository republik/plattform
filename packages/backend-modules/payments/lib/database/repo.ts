import type {
  Company,
  Order,
  PaymentGateway,
  Subscription,
  SubscriptionKind,
  Webhook,
  WebhookSource,
} from '../types'

export type WebhookArgs<T> = {
  source: WebhookSource
  sourceId: string
  payload: T
}

export interface PaymentWebhookRepo {
  logWebhookEvent<T>(webhook: WebhookArgs<T>): Promise<Webhook<T>>
  findWebhookEvent<T>(sourceId: string): Promise<Webhook<T>>
}

export interface CustomerRepo {
  getCustomerIdForCompany(userId: string, company: Company): Promise<string>
  saveCustomerIdForCompany(
    userId: string,
    company: Company,
    customerId: string,
  ): Promise<string>
}

export interface SubscriptionRepo {
  getUserSubscriptions(userId: string): Promise<Subscription[]>
  addUserSubscriptions(
    userId: string,
    args: AddSubscriptionArgs,
  ): Promise<Subscription>
}

export type OrderArgs = {
  total: number
  payement_status: Order['payment_status']
}

export interface OrderRepo {
  getOrders(userId: string): Promise<Order>
  saveOrder(userId: string, order: OrderArgs): Promise<Order>
}

export type AddSubscriptionArgs = {
  userId: string
  kind: SubscriptionKind
  gateway: PaymentGateway
  gatewayId: string
}
