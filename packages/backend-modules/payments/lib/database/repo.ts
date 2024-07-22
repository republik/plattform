import type {
  Company,
  Order,
  Subscription,
  SubscriptionArgs,
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
  findWebhookEvent<T>(sourceId: string): Promise<Webhook<T> | null>
}

export interface CustomerRepo {
  getCustomerIdForCompany(
    userId: string,
    company: Company,
  ): Promise<{ companyId: string; company: Company } | null>
  saveCustomerIdForCompany(
    userId: string,
    company: Company,
    customerId: string,
  ): Promise<string>
  saveCustomerIds(
    userId: string,
    customerIds: { customerId: string; company: string }[],
  ): Promise<void>
}

export interface SubscriptionRepo {
  getUserSubscriptions(userId: string): Promise<Subscription[]>
  addUserSubscriptions(
    userId: string,
    args: SubscriptionArgs,
  ): Promise<Subscription>
}

export type OrderArgs = {
  customerId: string
  total: number
  totalBeforeDiscount: number
  company: Company
  paymentStatus: 'paid' | 'unpaid'
  items: any
  gatewayId: string
  invocieId?: string
}

export interface OrderRepo {
  getUserOrders(userId: string): Promise<Order[]>
  getOrder(orderId: string): Promise<Order>
  saveOrder(userId: string, order: OrderArgs): Promise<Order>
}
