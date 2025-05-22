import Stripe from 'stripe'
import { Company } from '../../types'
import { PaymentService } from '../../payments'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { NoticePaymentFailedTransactionalWorker } from '../../workers/NoticePaymentFailedTransactionalWorker'
import { PaymentProvider } from '../../providers/provider'
import { isPledgeBased } from './utils'

export async function processPaymentFailed(
  paymentService: PaymentService,
  company: Company,
  event: Stripe.InvoicePaymentFailedEvent,
) {
  const customerId = event.data.object.customer as string

  const userId = await paymentService.getUserIdForCompanyCustomer(
    company,
    customerId,
  )
  if (!userId) {
    throw Error(`User for ${customerId} does not exists`)
  }

  const externalSubId = event.data.object.subscription

  const sub = await PaymentProvider.forCompany(company).getSubscription(
    externalSubId as string,
  )

  if (!sub) {
    console.log(`Unknown stripe subscription ${sub}`)
    return
  }

  if (isPledgeBased(sub?.metadata)) {
    console.log(`pledge based subscription [${sub.id}]; skipping`)
    return
  }

  const subscription = await paymentService.getSubscription({
    externalId: externalSubId as string,
  })

  if (!subscription) {
    console.log(
      `subscription ${externalSubId} not present in subscription table; skipping event ${event.id}`,
    )
    return
  }

  if (sub.status !== 'past_due') {
    console.log(
      `stripe subscription ${sub.id} for subscription ${subscription.id} is not in past_due state, nothing to do`,
    )
    return
  }

  if (sub?.status === 'past_due') {
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
