import { UserRow } from '@orbiting/backend-modules-types'
import type {
  Company,
  Order,
  Subscription,
  SubscriptionArgs,
  PaymentItemLocator,
  SubscriptionUpdateArgs,
  Webhook,
  WebhookSource,
  Invoice,
  SubscriptionStatus,
} from '../types'

export type WebhookArgs<T> = {
  source: WebhookSource
  company: Company
  sourceId: string
  payload: T
}

export type WebhookUpdateArgs<T> = {
  company?: Company
  sourceId?: string
  processed?: boolean
  payload?: T
}

export interface PaymentWebhookRepo {
  insertWebhookEvent<T>(webhook: WebhookArgs<T>): Promise<Webhook<T>>
  findWebhookEventBySourceId<T>(sourceId: string): Promise<Webhook<T> | null>
  updateWebhookEvent<T>(
    eventId: string,
    webhook: WebhookUpdateArgs<T>,
  ): Promise<Webhook<T>>
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
  getSubscription(by: PaymentItemLocator): Promise<Subscription | null>
  getUserSubscriptions(
    userId: string,
    onlyStatus?: SubscriptionStatus[],
  ): Promise<Subscription[]>
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
  company: Company
  status: 'paid' | 'unpaid'
  externalId: string
  invoiceId: string
  subscriptionId?: string
}

export type OrderRepoArgs = {
  userId: string
  company: Company
  status: 'paid' | 'unpaid'
  externalId: string
  invoiceId?: string
  subscriptionId?: string
}

export interface OrderRepo {
  getUserOrders(userId: string): Promise<Order[]>
  getOrder(orderId: string): Promise<Order | null>
  saveOrder(order: OrderRepoArgs): Promise<Order>
  getInvoice(by: PaymentItemLocator): Promise<Invoice | null>
  saveInvoice(userId: string, args: any): Promise<Invoice>
  updateInvoice(by: PaymentItemLocator, args: any): Promise<Invoice>
}

export interface MailingsRepo {
  getUser(userId: string): Promise<UserRow>
  isUserFirstTimeSubscriber(
    userId: string,
    subscriptionId: string,
  ): Promise<boolean>
}

export interface PaymentServiceRepo
  extends CustomerRepo,
    OrderRepo,
    SubscriptionRepo,
    PaymentWebhookRepo,
    MailingsRepo {}
