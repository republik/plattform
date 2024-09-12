import Stripe from 'stripe'
import { PaymentService } from '../../payments'
import { Company } from '../../types'
import { PaymentSetupTransactionalWorker } from '../../workers/PaymentSetupTransactionalWorker'
import { Queue } from '@orbiting/backend-modules-job-queue'

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
  if (customFields.length > 0) {
    console.log(customFields)
    const firstNameField = customFields.find(
      (field) => field.key === 'firstName',
    )
    const lastNameField = customFields.find((field) => field.key === 'lastName')

    const firstName = firstNameField?.text?.value
    const lastName = lastNameField?.text?.value

    if (firstName && lastName) {
      await paymentService.updateUserName(userId, firstName, lastName)
    }
  }

  let paymentStatus = event.data.object.payment_status
  if (paymentStatus === 'no_payment_required') {
    // no payments required are treated as paid
    paymentStatus = 'paid'
  }

  const total = event.data.object.amount_total || 0
  const totalBeforeDiscount = event.data.object.amount_subtotal || 0

  const order = await paymentService.saveOrder(userId, {
    company: company,
    total: total,
    totalBeforeDiscount: totalBeforeDiscount,
    externalId: event.data.object.id,
    items: event.data.object.line_items || [],
    invoiceExternalId: event.data.object.invoice as string | undefined,
    subscriptionExternalId: event.data.object.subscription as
      | string
      | undefined,
    paymentStatus: paymentStatus as 'paid' | 'unpaid',
  })

  const queue = Queue.getInstance()

  await Promise.all([
    queue.send<PaymentSetupTransactionalWorker>(
      'payments:transactional:mail:setup',
      {
        $version: 'v1',
        eventSourceId: event.id,
        orderId: order.id,
        userId: userId,
      },
    ),
  ])

  return
}
