import type {
  Company,
  Order,
  Subscription,
  SubscriptionArgs,
  PaymentItemLocator,
  SubscriptionUpdateArgs,
  Webhook,
  WebhookSource,
} from '../types'

export type WebhookArgs<T> = {
  source: WebhookSource
  company: Company
  sourceId: string
  payload: T
}

export interface PaymentWebhookRepo {
  logWebhookEvent<T>(webhook: WebhookArgs<T>): Promise<Webhook<T>>
  findWebhookEventBySourceId<T>(sourceId: string): Promise<Webhook<T> | null>
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
  getSubscription(by: PaymentItemLocator): Promise<Subscription>
  getUserSubscriptions(userId: string): Promise<Subscription[]>
  addUserSubscriptions(
    userId: string,
    args: SubscriptionArgs,
  ): Promise<Subscription>
  updateSubscription(
    by: PaymentItemLocator,
    args: SubscriptionUpdateArgs,
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
  invocieGatewayId?: string
  subscriptionGatewayId?: string
}

export interface OrderRepo {
  getUserOrders(userId: string): Promise<Order[]>
  getOrder(orderId: string): Promise<Order>
  saveOrder(userId: string, order: OrderArgs): Promise<Order>
  saveInvoice(userId: string, args: any): Promise<any>
  updateInvoice(by: PaymentItemLocator, args: any): Promise<any>
}

export interface PaymentServiceRepo
  extends CustomerRepo,
    OrderRepo,
    SubscriptionRepo,
    PaymentWebhookRepo {}
