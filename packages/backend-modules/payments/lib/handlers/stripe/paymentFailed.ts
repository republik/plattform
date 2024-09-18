import Stripe from 'stripe'
import { Company } from '../../types'
import { PaymentService } from '../../payments'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { NoticePaymentFailedTransactionalWorker } from '../../workers/NoticePaymentFailedTransactionalWorker'

export async function processPaymentFailed(
  paymentService: PaymentService,
  _company: Company,
  event: Stripe.InvoicePaymentFailedEvent,
) {
  const customerId = event.data.object.customer as string

  const userId = await paymentService.getUserIdForCompanyCustomer(
    _company,
    customerId,
  )
  if (!userId) {
    throw Error(`User for ${customerId} does not exists`)
  }

  const subscription = await paymentService.getSubscription({
    externalId: event.data.object.subscription as string,
  })

  if (subscription?.status !== 'past_due') {
    throw new Error(
      `subscription of failed invoice ${event.data.object.id} is not past_due but ${subscription?.status}, retrying`,
    )
  }

  if (subscription?.status === 'past_due') {
    const queue = Queue.getInstance()

    await Promise.all([
      queue.send<NoticePaymentFailedTransactionalWorker>(
        'payments:transactional:notice:payment_failed',
        {
          $version: 'v1',
          eventSourceId: event.id,
          userId: userId,
          invoiceExternalId: event.data.object.id,
        },
      ),
    ])
  }

  return
}
