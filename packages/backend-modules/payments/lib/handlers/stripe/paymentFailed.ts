import Stripe from 'stripe'
import { Company, PaymentWorkflow } from '../../types'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { NoticePaymentFailedTransactionalWorker } from '../../workers/NoticePaymentFailedTransactionalWorker'
import { isPledgeBased } from './utils'
import { PaymentWebhookContext } from '../../workers/StripeWebhookWorker'
import { PaymentService } from '../../services/PaymentService'
import { CustomerInfoService } from '../../services/CustomerInfoService'
import { SubscriptionService } from '../../services/SubscriptionService'

class PaymentFailedWorkflow
  implements PaymentWorkflow<Stripe.InvoicePaymentFailedEvent>
{
  private customerInfoService: CustomerInfoService
  private paymentService: PaymentService
  private subscriptionService: SubscriptionService
  private paymentFailedNotifiyer: PaymentFailedNotifier

  constructor(
    paymentService: PaymentService,
    customerInfoService: CustomerInfoService,
    subscriptionService: SubscriptionService,
    paymentFailedNotifiyer: PaymentFailedNotifier,
  ) {
    this.paymentService = paymentService
    this.customerInfoService = customerInfoService
    this.subscriptionService = subscriptionService
    this.paymentFailedNotifiyer = paymentFailedNotifiyer
  }

  async run(company: Company, event: Stripe.InvoicePaymentFailedEvent) {
    const stripeInvoiceId = event.data.object.id!

    const invoice = await this.paymentService.getInvoice(
      company,
      stripeInvoiceId,
    )

    if (!invoice) {
      console.error(`unknown invoice ${stripeInvoiceId}`)
      return
    }

    const customerId = invoice.customer as string
    const stripeSubId = invoice.parent?.subscription_details
      ?.subscription as string

    const userId = await this.customerInfoService.getUserIdForCompanyCustomer(
      company,
      customerId,
    )
    if (!userId) {
      throw Error(`User for ${customerId} does not exists`)
    }

    const sub = await this.paymentService.getSubscription(company, stripeSubId)

    if (!sub) {
      console.log(`Unknown stripe subscription ${stripeSubId}`)
      return
    }

    if (isPledgeBased(sub?.metadata)) {
      console.log(`pledge based subscription [${sub.id}]; skipping`)
      return
    }

    const subscription = await this.subscriptionService.getSubscription({
      externalId: stripeSubId,
    })

    if (!subscription) {
      console.log(
        `subscription ${stripeSubId} not present in subscription table; skipping event ${event.id}`,
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
      await this.paymentFailedNotifiyer.notify(
        userId,
        event.id,
        stripeInvoiceId,
        company,
      )
    }

    return
  }
}

class PaymentFailedNotifier {
  constructor(protected readonly queue: Queue) {}

  async notify(
    userId: string,
    eventId: string,
    invoiceExternalId: string,
    company: Company,
  ) {
    return this.queue.send<NoticePaymentFailedTransactionalWorker>(
      'payments:transactional:notice:payment_failed',
      {
        $version: 'v1',
        eventSourceId: eventId,
        userId: userId,
        invoiceExternalId: invoiceExternalId,
        company: company,
      },
    )
  }
}

export async function processPaymentFailed(
  ctx: PaymentWebhookContext,
  company: Company,
  event: Stripe.InvoicePaymentFailedEvent,
) {
  return new PaymentFailedWorkflow(
    new PaymentService(),
    new CustomerInfoService(ctx.pgdb),
    new SubscriptionService(ctx.pgdb),
    new PaymentFailedNotifier(Queue.getInstance()),
  ).run(company, event)
}
