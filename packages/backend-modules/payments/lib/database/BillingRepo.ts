import { PgDb } from 'pogi'
import {
  ChargeInsert,
  ChargeUpdate,
  Company,
  Invoice,
  InvoiceRepoArgs,
  Order,
  PaymentItemLocator,
  STATUS_TYPES,
  Subscription,
  SubscriptionArgs,
  SubscriptionStatus,
  SubscriptionUpdateArgs,
} from '../types'
import { ACTIVE_STATUS_TYPES } from '../types'

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

export interface PaymentBillingRepo {
  getSubscription(by: PaymentItemLocator): Promise<Subscription | null>
  getUserSubscriptions(
    userId: string,
    onlyStatus?: SubscriptionStatus[],
  ): Promise<Subscription[]>
  saveSubscriptions(
    userId: string,
    args: SubscriptionArgs,
  ): Promise<Subscription>
  updateSubscription(
    by: PaymentItemLocator,
    args: SubscriptionUpdateArgs,
  ): Promise<Subscription>
  getUserOrders(userId: string): Promise<Order[]>
  getOrder(orderId: string): Promise<Order | null>
  saveOrder(order: OrderRepoArgs): Promise<Order>
  getInvoice(by: PaymentItemLocator): Promise<Invoice | null>
  saveInvoice(userId: string, args: any): Promise<Invoice>
  updateInvoice(by: PaymentItemLocator, args: any): Promise<Invoice>
  getCharge(by: PaymentItemLocator): Promise<any | null>
  saveCharge(args: any): Promise<any>
  updateCharge(by: PaymentItemLocator, args: any): Promise<any | null>
  getActiveUserSubscription(userId: string): Promise<Subscription | null>
}

export class BillingRepo implements PaymentBillingRepo {
  #pgdb: PgDb
  constructor(dbConn: PgDb) {
    this.#pgdb = dbConn
  }

  getOrder(orderId: string): Promise<Order> {
    return this.#pgdb.payments.orders.findOne({
      id: orderId,
    })
  }

  getUserOrders(userId: string): Promise<Order[]> {
    return this.#pgdb.payments.orders.findWhere({
      userId,
    })
  }

  saveOrder(order: OrderRepoArgs): Promise<Order> {
    return this.#pgdb.payments.orders.insertAndGet(order)
  }

  getSubscription(by: PaymentItemLocator): Promise<Subscription | null> {
    return this.#pgdb.payments.subscriptions.findOne(by)
  }

  getActiveUserSubscription(userId: string): Promise<Subscription | null> {
    return this.#pgdb.payments.subscriptions.findFirst(
      {
        userId,
        status: ACTIVE_STATUS_TYPES,
      },
      { orderBy: { currentPeriodStart: 'asc' } },
    )
  }

  getUserSubscriptions(
    userId: string,
    onlyStatus: SubscriptionStatus[] = STATUS_TYPES,
  ): Promise<Subscription[]> {
    return this.#pgdb.payments.subscriptions.find(
      {
        userId,
        status: onlyStatus,
      },
      { orderBy: { currentPeriodStart: 'asc' } },
    )
  }

  saveSubscriptions(
    userId: string,
    args: SubscriptionArgs,
  ): Promise<Subscription> {
    return this.#pgdb.payments.subscriptions.insertAndGet({
      userId: userId,
      ...args,
    })
  }

  updateSubscription(
    by: PaymentItemLocator,
    args: SubscriptionUpdateArgs,
  ): Promise<Subscription> {
    return this.#pgdb.payments.subscriptions.updateAndGetOne(by, args)
  }

  getInvoice(by: PaymentItemLocator): Promise<Invoice | null> {
    return this.#pgdb.payments.invoices.findOne(by)
  }

  saveInvoice(userId: string, args: InvoiceRepoArgs): Promise<Invoice> {
    return this.#pgdb.payments.invoices.insertAndGet({
      userId,
      ...args,
    })
  }

  updateInvoice(by: PaymentItemLocator, args: any): Promise<Invoice> {
    return this.#pgdb.payments.invoices.updateAndGet(by, {
      ...args,
    })
  }

  getCharge(by: PaymentItemLocator) {
    return this.#pgdb.payments.charges.findOne(by)
  }

  saveCharge(args: ChargeInsert): Promise<any> {
    return this.#pgdb.payments.charges.insert(args)
  }

  updateCharge(
    charge: PaymentItemLocator,
    args: ChargeUpdate,
  ): Promise<any | null> {
    return this.#pgdb.payments.charges.updateAndGet(charge, args)
  }
}
