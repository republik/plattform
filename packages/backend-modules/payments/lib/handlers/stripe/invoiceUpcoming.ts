import { Company, PaymentWorkflow } from '../../types'
import { PaymentWebhookContext } from '../../workers/StripeWebhookWorker'
import Stripe from 'stripe'
import { CustomerInfoService } from '../../services/CustomerInfoService'
import { SubscriptionService } from '../../services/SubscriptionService'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { NoticeRenewalTransactionalWorker } from '../../workers/NoticeRenewalTransactionalWorker'

export class InvoiceUpcomingWorkflow
  implements PaymentWorkflow<Stripe.InvoiceUpcomingEvent>
{
  constructor(
    protected readonly customerInfoService: CustomerInfoService,
    protected readonly subscriptionService: SubscriptionService,
  ) {}

  async run(
    company: Company,
    event: Stripe.InvoiceUpcomingEvent,
  ): Promise<any> {
    if (company === 'REPUBLIK') {
      // no reminders for monthly subscriptions
      console.log('No reminders for monthly subscriptions')
      return
    }

    const customerId = event.data.object.customer as string
    const externalSubscriptionId = event.data.object.parent
      ?.subscription_details?.subscription as string

    const userId = await this.customerInfoService.getUserIdForCompanyCustomer(
      company,
      customerId,
    )

    if (!userId) {
      throw new Error(`Unknown customer ${customerId}`)
    }

    const subscription = await this.subscriptionService.getSubscription({
      externalId: externalSubscriptionId,
    })

    if (!subscription) {
      throw new Error(`Unknown subscription ${externalSubscriptionId}`)
    }

    const queue = Queue.getInstance()

    await queue.send<NoticeRenewalTransactionalWorker>(
      'payments:transactional:notice:subscription_renewal',
      {
        $version: 'v1',
        eventSourceId: event.id,
        userId: userId,
        subscriptionId: subscription.id,
        company: company,
      },
    )
  }
}

export async function processInvoiceUpcoming(
  ctx: PaymentWebhookContext,
  company: Company,
  event: Stripe.InvoiceUpcomingEvent,
) {
  return new InvoiceUpcomingWorkflow(
    new CustomerInfoService(ctx.pgdb),
    new SubscriptionService(ctx.pgdb),
  ).run(company, event)
}
