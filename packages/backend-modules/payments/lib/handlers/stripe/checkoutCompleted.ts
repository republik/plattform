import Stripe from 'stripe'
import { PaymentInterface } from '../../payments'
import { Company } from '../../types'
import { ConfirmSetupTransactionalWorker } from '../../workers/ConfirmSetupTransactionalWorker'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { SyncMailchimpSetupWorker } from '../../workers/SyncMailchimpSetupWorker'
import { PaymentProvider } from '../../providers/provider'
import { mapSubscriptionArgs } from './subscriptionCreated'
import { mapInvoiceArgs } from './invoiceCreated'
import { mapChargeArgs } from './invoicePaymentSucceeded'
import { ConnectionContext } from '@orbiting/backend-modules-types'
import { GiftShop } from '../../shop/gifts'
import { sendGiftPurchaseMail } from '../../transactionals/sendTransactionalMails'
import { UserDataRepo } from '../../database/UserRepo'

type PaymentWebhookContext = {
  payments: PaymentInterface
} & ConnectionContext

class CheckoutProcessingError extends Error {
  constructor(msg: string) {
    super(msg)
    this.name = 'CheckoutProcessingError'
  }
}

export async function processCheckoutCompleted(
  ctx: PaymentWebhookContext,
  company: Company,
  event: Stripe.CheckoutSessionCompletedEvent,
) {
  switch (event.data.object.mode) {
    case 'subscription': {
      return handleSubscription(ctx, company, event)
    }
    case 'payment': {
      return handlePayment(ctx, company, event)
    }
  }
}

async function handleSubscription(
  ctx: PaymentWebhookContext,
  company: Company,
  event: Stripe.CheckoutSessionCompletedEvent,
) {
  const payments = ctx.payments

  const customerId = event.data.object.customer?.toString()
  if (!customerId) {
    throw new CheckoutProcessingError('No stripe customer')
  }

  const userId = await payments.getUserIdForCompanyCustomer(company, customerId)
  if (!userId) {
    throw Error(`User for ${customerId} does not exists`)
  }

  let paymentStatus = event.data.object.payment_status
  if (paymentStatus === 'no_payment_required') {
    // no payments required are treated as paid
    paymentStatus = 'paid'
  }

  let subId: string | undefined
  const externalSubId = event.data.object.subscription
  if (typeof externalSubId === 'string') {
    // if checkout contains a subscription that is not in the database try to save it
    const s = await payments.getSubscription({ externalId: externalSubId })
    if (!s) {
      const subscription = await PaymentProvider.forCompany(
        company,
      ).getSubscription(externalSubId)
      if (subscription) {
        const args = mapSubscriptionArgs(company, subscription)
        subId = (await payments.setupSubscription(userId, args)).id
      }
    } else {
      subId = s.id
    }
  }

  let invoiceId: string | undefined
  const extInvoiceId = event.data.object.invoice
  if (typeof extInvoiceId === 'string') {
    const i = await payments.getInvoice({ externalId: extInvoiceId })
    if (!i) {
      // if checkout contains a invoice that is not in the database try to save it
      const invoiceData = await PaymentProvider.forCompany(company).getInvoice(
        extInvoiceId as string,
      )
      if (invoiceData) {
        const args = mapInvoiceArgs(company, invoiceData)
        invoiceId = (await payments.saveInvoice(userId, args)).id
        const chargeArgs = mapChargeArgs(
          company,
          invoiceId,
          invoiceData.charge as Stripe.Charge,
        )
        try {
          await payments.saveCharge(chargeArgs)
        } catch (e) {
          if (e instanceof Error) {
            console.log(`Error recording charge: ${e.message}`)
          }
        }
      }
    } else {
      invoiceId = i.id
    }
  }

  const order = await payments.saveOrder({
    userId: userId,
    company: company,
    externalId: event.data.object.id,
    invoiceId: invoiceId as string,
    subscriptionId: subId as string,
    status: paymentStatus as 'paid' | 'unpaid',
  })

  const sess = await PaymentProvider.forCompany(company).getCheckoutSession(
    event.data.object.id,
  )

  if (!sess) {
    throw new CheckoutProcessingError('checkout session does not exist')
  }

  const lineItems = sess.line_items?.data.map((line) => {
    return {
      lineItemId: line.id,
      externalPriceId: line.price!.id,
      priceLookupKey: line.price!.lookup_key,
      description: line.description,
      quantity: line.quantity,
      price: line.amount_total,
      priceSubtotal: line.amount_subtotal,
      taxAmount: line.amount_tax,
      discountAmount: line.amount_discount,
    }
  })

  const orderLineItems = lineItems?.map((i) => {
    return { orderId: order.id, ...i }
  })

  await ctx.pgdb.payments.orderLineItems.insert(orderLineItems)

  const queue = Queue.getInstance()

  await Promise.all([
    queue.send<ConfirmSetupTransactionalWorker>(
      'payments:transactional:confirm:setup',
      {
        $version: 'v1',
        eventSourceId: event.id,
        invoiceId: invoiceId as string,
        userId: userId,
      },
    ),
    queue.send<SyncMailchimpSetupWorker>('payments:mailchimp:sync:setup', {
      $version: 'v1',
      eventSourceId: event.id,
      userId: userId,
    }),
  ])
  return
}

async function handlePayment(
  ctx: PaymentWebhookContext,
  company: Company,
  event: Stripe.CheckoutSessionCompletedEvent,
) {
  const giftShop = new GiftShop(ctx.pgdb)

  const sess = await PaymentProvider.forCompany(company).getCheckoutSession(
    event.data.object.id,
  )

  if (!sess) {
    throw new CheckoutProcessingError('checkout session does not exist')
  }

  if (!sess.line_items) {
    throw new CheckoutProcessingError('checkout session has no line items')
  }

  let userId = undefined
  if (typeof sess.customer !== 'undefined') {
    userId =
      (await ctx.payments.getUserIdForCompanyCustomer(
        company,
        sess.customer as string,
      )) ?? undefined
  }

  let paymentStatus = event.data.object.payment_status
  if (paymentStatus === 'no_payment_required') {
    // no payments required are treated as paid
    paymentStatus = 'paid'
  }

  const lineItems = sess.line_items.data.map((line) => {
    return {
      lineItemId: line.id,
      externalPriceId: line.price!.id,
      priceLookupKey: line.price!.lookup_key,
      description: line.description,
      quantity: line.quantity,
      price: line.amount_total,
      priceSubtotal: line.amount_subtotal,
      taxAmount: line.amount_tax,
      discountAmount: line.amount_discount,
    }
  })

  let addressId: string | undefined = undefined
  if (sess.shipping_details) {
    const shippingAddress = sess.shipping_details.address!
    const data = {
      name: sess.shipping_details.name!,
      city: shippingAddress.city,
      line1: shippingAddress.line1,
      line2: shippingAddress.line2,
      postalCode: shippingAddress.postal_code,
      country: new Intl.DisplayNames(['de-CH'], { type: 'region' }).of(
        shippingAddress.country!,
      ),
    }
    addressId = (await new UserDataRepo(ctx.pgdb).insertAddress(data)).id
  }

  const orderDraft = {
    userId: userId,
    customerEmail:
      typeof userId === 'undefined' ? sess.customer_details!.email! : undefined,
    company: company,
    metadata: sess.metadata,
    externalId: event.data.object.id,
    status: paymentStatus as 'paid' | 'unpaid',
    shippingAddressId: addressId,
  }

  const order = await ctx.payments.saveOrder(orderDraft)

  const orderLineItems = lineItems.map((i) => {
    return { orderId: order.id, ...i }
  })

  await ctx.pgdb.payments.orderLineItems.insert(orderLineItems)

  const giftCodes = []
  for (const item of lineItems) {
    if (item.priceLookupKey?.startsWith('GIFT')) {
      const code = await giftShop.generateNewVoucher({
        company: company,
        orderId: order.id,
        giftId: item.priceLookupKey,
      })
      giftCodes.push(code)
    }
  }

  if (giftCodes.length) {
    await sendGiftPurchaseMail(
      {
        email: sess.customer_details!.email!,
        voucherCode: giftCodes[0].code.replace(/(\w{4})(\w{4})/, '$1-$2'),
      },
      ctx.pgdb,
    )
  }
}
