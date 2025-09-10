import { PgDb } from 'pogi'
import {
  ChargeInsert,
  ChargeUpdate,
  Invoice,
  InvoiceArgs,
  InvoiceUpdateArgs,
  Order,
  SelectCriteria,
} from '../types'
import {
  BillingRepo,
  OrderArgs,
  PaymentBillingRepo,
} from '../database/BillingRepo'

type OrderLineItem = {
  orderId: string
  lineItemId: string
  externalPriceId: string
  priceLookupKey: string | null
  description: string | undefined
  quantity: number | null
  price: number
  priceSubtotal: number
  taxAmount: number
  discountAmount: number
}

export class InvoiceService {
  protected pgdb: PgDb
  protected billing: PaymentBillingRepo

  constructor(pgdb: PgDb) {
    this.pgdb = pgdb
    this.billing = new BillingRepo(pgdb)
  }

  getSubscriptionInvoices(subscriptionId: string): Promise<Invoice> {
    return this.pgdb.payments.invoices.find({ subscriptionId })
  }

  async saveInvoice(userId: string, args: InvoiceArgs): Promise<Invoice> {
    const tx = await this.pgdb.transactionBegin()
    const txRepo = new BillingRepo(tx)
    try {
      let subId: string | undefined = undefined
      if (args.externalSubscriptionId) {
        const sub = await txRepo.getSubscription({
          externalId: args.externalSubscriptionId,
        })
        if (!sub) {
          throw Error('Subscription not found')
        }
        subId = sub.id
      }

      const sub = await txRepo.saveInvoice(userId, {
        externalId: args.externalId,
        items: args.items,
        company: args.company,
        status: args.status,
        metadata: args.metadata,
        periodStart: args.periodStart,
        periodEnd: args.periodEnd,
        total: args.total,
        totalDiscountAmount: args.totalDiscountAmount,
        totalBeforeDiscount: args.totalBeforeDiscount,
        totalDiscountAmounts: args.totalDiscountAmounts,
        totalExcludingTax: args.totalExcludingTax,
        totalTaxAmount: args.totalTaxAmount,
        totalTaxAmounts: args.totalTaxAmounts,
        discounts: args.discounts,
        subscriptionId: subId,
      })

      await tx.transactionCommit()
      return sub
    } catch (e) {
      console.log(e)
      await tx.transactionRollback()
      throw e
    }
  }

  getInvoice(by: SelectCriteria): Promise<Invoice | null> {
    return this.billing.getInvoice(by)
  }

  updateInvoice(by: SelectCriteria, args: InvoiceUpdateArgs): Promise<Invoice> {
    return this.billing.updateInvoice(by, args)
  }

  getCharge(by: SelectCriteria): Promise<any> {
    return this.billing.getCharge(by)
  }

  saveCharge(args: ChargeInsert): Promise<any> {
    return this.billing.saveCharge(args)
  }

  updateCharge(by: SelectCriteria, args: ChargeUpdate): Promise<any> {
    return this.billing.updateCharge(by, args)
  }

  listUserOrders(userId: string): Promise<Order[]> {
    return this.billing.getUserOrders(userId)
  }

  getOrder(id: string): Promise<Order | null> {
    return this.billing.getOrder(id)
  }

  getOrderByPaymentIntent(paymentIntentId: string): Promise<Order | null> {
    return this.billing.getOrderByPaymentIntent(paymentIntentId)
  }

  saveOrder(order: OrderArgs): Promise<Order> {
    return this.billing.saveOrder(order)
  }

  saveOrderItems(orderItems: OrderLineItem[]): Promise<any> {
    return this.pgdb.payments.orderLineItems.insert(orderItems)
  }
}
