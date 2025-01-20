import Stripe from 'stripe'
import { PaymentService } from '../../payments'
import { Company } from '../../types'
import { ConfirmSetupTransactionalWorker } from '../../workers/ConfirmSetupTransactionalWorker'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { SyncMailchimpSetupWorker } from '../../workers/SyncMailchimpSetupWorker'
import { PaymentProvider } from '../../providers/provider'
import { mapSubscriptionArgs } from './subscriptionCreated'
import { mapInvoiceArgs } from './invoiceCreated'
import { SyncAddressDataWorker } from '../../workers/SyncAddressDataWorker'
import { mapChargeArgs } from './invoicePaymentSucceeded'
import { ConnectionContext } from '@orbiting/backend-modules-types'
import { GiftShop } from '../../shop/gifts'
import { sendGiftPurchaseMail } from '../../transactionals/sendTransactionalMails'

type PaymentWebhookContext = {
  paymentService: PaymentService
} & ConnectionContext

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
  const paymentService = ctx.paymentService

  const customerId = event.data.object.customer as string
  if (!customerId) {
    console.log('No stripe customer provided; skipping')
    return
  }

  if (!event.data.object.subscription) {
    console.log('Non subscription checkouts currently not supported')
    return
  }

  const userId = await paymentService.getUserIdForCompanyCustomer(
    company,
    customerId,
  )
  if (!userId) {
    throw Error(`User for ${customerId} does not exists`)
  }

  const customFields = event.data.object.custom_fields
  await syncUserNameData(paymentService, userId, customFields)

  let paymentStatus = event.data.object.payment_status
  if (paymentStatus === 'no_payment_required') {
    // no payments required are treated as paid
    paymentStatus = 'paid'
  }

  let subId: string | undefined
  const extSubId = event.data.object.subscription
  if (typeof extSubId === 'string') {
    // if checkout contains a subscription that is not in the database try to save it
    const s = await paymentService.getSubscription({ externalId: extSubId })
    if (!s) {
      const subscription = await PaymentProvider.forCompany(
        company,
      ).getSubscription(extSubId as string)
      if (subscription) {
        const args = mapSubscriptionArgs(company, subscription)
        subId = (await paymentService.setupSubscription(userId, args)).id
      }
    } else {
      subId = s.id
    }
  }

  let invoiceId: string | undefined
  const extInvoiceId = event.data.object.invoice
  if (typeof extInvoiceId === 'string') {
    const i = await paymentService.getInvoice({ externalId: extInvoiceId })
    if (!i) {
      // if checkout contains a invoice that is not in the database try to save it
      const invoiceData = await PaymentProvider.forCompany(company).getInvoice(
        extInvoiceId as string,
      )
      if (invoiceData) {
        const args = mapInvoiceArgs(company, invoiceData)
        invoiceId = (await paymentService.saveInvoice(userId, args)).id
        const chargeArgs = mapChargeArgs(
          company,
          invoiceId,
          invoiceData.charge as Stripe.Charge,
        )
        try {
          await paymentService.saveCharge(chargeArgs)
        } catch (e) {
          if (e instanceof Error) {
            console.log('Error recording charge: %s', e.message)
          }
        }
      }
    } else {
      invoiceId = i.id
    }
  }

  await paymentService.saveOrder({
    userId: userId,
    company: company,
    externalId: event.data.object.id,
    invoiceId: invoiceId as string,
    subscriptionId: subId as string,
    status: paymentStatus as 'paid' | 'unpaid',
  })

  const queue = Queue.getInstance()

  const addressData = event.data.object.customer_details?.address

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
    addressData
      ? queue.send<SyncAddressDataWorker>(
          'payments:stripe:checkout:sync-address',
          {
            $version: 'v1',
            userId: userId,
            address: addressData,
          },
        )
      : undefined,
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
    throw new Error('checkout session does not exist')
  }

  if (!sess.line_items) {
    throw new Error(
      'checkout session has no line items unable to process checkout',
    )
  }

  let userId = undefined
  if (typeof sess.customer !== 'undefined') {
    userId =
      (await ctx.paymentService.getUserIdForCompanyCustomer(
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

  const orderDraft = {
    userId: userId,
    customerEmail:
      typeof userId === 'undefined' ? sess.customer_details!.email! : undefined,
    company: company,
    metadata: sess.metadata,
    externalId: event.data.object.id,
    status: paymentStatus as 'paid' | 'unpaid',
  }

  const order = await ctx.paymentService.saveOrder(orderDraft)

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

  // TODO!: Insert shipping address
  await sendGiftPurchaseMail(
    {
      email: sess.customer_details!.email!,
      voucherCode: giftCodes[0].code.replace(/(\w{4})(\w{4})/, '$1-$2'),
    },
    ctx.pgdb,
  )
}

async function syncUserNameData(
  paymentService: PaymentService,
  userId: string,
  customFields: Stripe.Checkout.Session.CustomField[],
) {
  if (customFields.length > 0) {
    const firstNameField = customFields.find(
      (field) => field.key === 'firstName',
    )
    const lastNameField = customFields.find((field) => field.key === 'lastName')

    const firstName = firstNameField?.text?.value
    const lastName = lastNameField?.text?.value

    if (firstName && lastName) {
      return await paymentService.updateUserName(userId, firstName, lastName)
    }

    return null
  }
}
