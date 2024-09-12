import Stripe from 'stripe'
import { PaymentService } from '../../payments'
import { Company } from '../../types'
import { ConfirmSetupTransactionalWorker } from '../../workers/ConfirmSetupTransactionalWorker'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { SyncMailchimpWorker } from '../../workers/SyncMailchimpWorker'
import { PaymentProvider } from '../../providers/provider'
import { mapSubscriptionArgs } from './subscriptionCreated'
import { mapInvoiceArgs } from './invoiceCreated'

export async function processCheckoutCompleted(
  paymentService: PaymentService,
  company: Company,
  event: Stripe.CheckoutSessionCompletedEvent,
) {
  const customerId = event.data.object.customer as string

  const userId = await paymentService.getUserIdForCompanyCustomer(
    company,
    customerId,
  )
  if (!userId) {
    throw Error(`User for ${customerId} does not exists`)
  }

  const customFields = event.data.object.custom_fields
  await syncUserNameData(paymentService, userId, customFields)
  // const adressData = event.data.object.invoice

  // await syncAddressData(paymentService, userId)

  let paymentStatus = event.data.object.payment_status
  if (paymentStatus === 'no_payment_required') {
    // no payments required are treated as paid
    paymentStatus = 'paid'
  }

  const subId = event.data.object.subscription
  if (typeof subId === 'string') {
    // if checkout contains a subscription that is not in the database try to save it
    if (!paymentService.getSubscription({ externalId: subId })) {
      const subscription = await PaymentProvider.forCompany(
        company,
      ).getSubscription(subId as string)
      if (subscription) {
        const args = mapSubscriptionArgs(company, subscription)
        await paymentService.setupSubscription(userId, args)
      }
    }
  }

  const invoiceId = event.data.object.invoice
  if (typeof invoiceId === 'string') {
    if (!paymentService.getInvoice({ externalId: invoiceId })) {
      // if checkout contains a invoice that is not in the database try to save it
      const invoice = await PaymentProvider.forCompany(company).getInvoice(
        invoiceId as string,
      )
      if (invoice) {
        const args = mapInvoiceArgs(company, invoice)
        await paymentService.saveInvoice(userId, args)
      }
    }
  }

  const total = event.data.object.amount_total || 0
  const totalBeforeDiscount = event.data.object.amount_subtotal || 0

  const order = await paymentService.saveOrder(userId, {
    company: company,
    total: total,
    totalBeforeDiscount: totalBeforeDiscount,
    externalId: event.data.object.id,
    items: event.data.object.line_items || [],
    invoiceExternalId: invoiceId as string | undefined,
    subscriptionExternalId: subId as string | undefined,
    paymentStatus: paymentStatus as 'paid' | 'unpaid',
  })

  const queue = Queue.getInstance()

  await Promise.all([
    queue.send<ConfirmSetupTransactionalWorker>(
      'payments:transactional:confirm:setup',
      {
        $version: 'v1',
        eventSourceId: event.id,
        orderId: order.id,
        userId: userId,
      },
    ),
    queue.send<SyncMailchimpWorker>('payments:mailchimp:sync', {
      $version: 'v1',
      eventSourceId: event.id,
      userId: userId,
    }),
  ])

  return
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
  }
}
