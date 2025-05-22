import { PgDb } from 'pogi'
import {
  ChargeInsert,
  ChargeUpdate,
  Company,
  Invoice,
  InvoiceRepoArgs,
  Order,
  SelectCriteria,
  STATUS_TYPES,
  Subscription,
  SubscriptionArgs,
  SubscriptionStatus,
  SubscriptionUpdateArgs,
} from '../types'
import { ACTIVE_STATUS_TYPES } from '../types'

export type OrderArgs = {
  userId?: string
  customerEmail?: string
  metadata?: any
  company: Company
  status: 'paid' | 'unpaid'
  externalId: string
  invoiceId?: string
  subscriptionId?: string
  shippingAddressId?: string
}

export type OrderRepoArgs = {
  userId?: string
  customerEmail?: string
  metadata?: any
  company: Company
  status: 'paid' | 'unpaid'
  externalId: string
  invoiceId?: string
  subscriptionId?: string
  shippingAddressId?: string
}

export interface PaymentBillingRepo {
  getSubscription(by: SelectCriteria): Promise<Subscription | null>
  getUserSubscriptions(
    userId: string,
    onlyStatus?: SubscriptionStatus[],
  ): Promise<Subscription[]>
  saveSubscriptions(
    userId: string,
    args: SubscriptionArgs,
  ): Promise<Subscription>
  updateSubscription(
    by: SelectCriteria,
    args: SubscriptionUpdateArgs,
  ): Promise<Subscription>
  getUserOrders(userId: string): Promise<Order[]>
  getOrder(orderId: string): Promise<Order | null>
  saveOrder(order: OrderRepoArgs): Promise<Order>
  getInvoice(by: SelectCriteria): Promise<Invoice | null>
  saveInvoice(userId: string, args: any): Promise<Invoice>
  updateInvoice(by: SelectCriteria, args: any): Promise<Invoice>
  getCharge(by: SelectCriteria): Promise<any | null>
  saveCharge(args: any): Promise<any>
  updateCharge(by: SelectCriteria, args: any): Promise<any | null>
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

  getSubscription(by: SelectCriteria): Promise<Subscription | null> {
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
    by: SelectCriteria,
    args: SubscriptionUpdateArgs,
  ): Promise<Subscription> {
    return this.#pgdb.payments.subscriptions.updateAndGetOne(by, {
      ...args,
      updatedAt: new Date(),
    })
  }

  getInvoice(by: SelectCriteria): Promise<Invoice | null> {
    return this.#pgdb.payments.invoices.findOne(by)
  }

  saveInvoice(userId: string, args: InvoiceRepoArgs): Promise<Invoice> {
    return this.#pgdb.payments.invoices.insertAndGet({
      userId,
      ...args,
    })
  }

  updateInvoice(by: SelectCriteria, args: any): Promise<Invoice> {
    return this.#pgdb.payments.invoices.updateAndGet(by, {
      ...args,
      updatedAt: new Date(),
    })
  }

  getCharge(by: SelectCriteria) {
    return this.#pgdb.payments.charges.findOne(by)
  }

  saveCharge(args: ChargeInsert): Promise<any> {
    return this.#pgdb.payments.charges.insert(args)
  }

  updateCharge(
    charge: SelectCriteria,
    args: ChargeUpdate,
  ): Promise<any | null> {
    return this.#pgdb.payments.charges.updateAndGet(charge, {
      ...args,
      updatedAt: new Date(),
    })
  }
}
