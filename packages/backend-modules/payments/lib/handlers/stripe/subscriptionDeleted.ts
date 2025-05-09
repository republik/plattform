import Stripe from 'stripe'
import { Company, PaymentWorkflow } from '../../types'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { NoticeEndedTransactionalWorker } from '../../workers/NoticeEndedTransactionalWorker'
import { SyncMailchimpEndedWorker } from '../../workers/SyncMailchimpEndedWorker'
import { parseStripeDate } from './utils'
import { PaymentWebhookContext } from '../../workers/StripeWebhookWorker'
import { CustomerInfoService } from '../../services/CustomerInfoService'
import { SubscriptionService } from '../../services/SubscriptionService'

class ProcessSubscriptionDeletedWorkflow
  implements PaymentWorkflow<Stripe.CustomerSubscriptionDeletedEvent>
{
  constructor(
    protected readonly queue: Queue,
    protected readonly customerInfoService: CustomerInfoService,
    protected readonly subscriptionService: SubscriptionService,
  ) {}

  async run(company: Company, event: Stripe.CustomerSubscriptionDeletedEvent) {
    await this.subscriptionService.disableSubscription(
      { externalId: event.data.object.id },
      {
        endedAt: parseStripeDate(event.data.object.ended_at || 0),
        canceledAt: parseStripeDate(event.data.object.canceled_at || 0),
      },
    )

    const customerId = event.data.object.customer as string

    const userId = await this.customerInfoService.getUserIdForCompanyCustomer(
      company,
      customerId,
    )
    if (!userId) {
      throw Error(`User for ${customerId} does not exists`)
    }

    await Promise.all([
      this.queue.send<NoticeEndedTransactionalWorker>(
        'payments:transactional:notice:ended',
        {
          $version: 'v1',
          eventSourceId: event.id,
          userId: userId,
        },
      ),
      this.queue.send<SyncMailchimpEndedWorker>(
        'payments:mailchimp:sync:ended',
        {
          $version: 'v1',
          eventSourceId: event.id,
          userId: userId,
        },
      ),
    ])

    return
  }
}

export async function processSubscriptionDeleted(
  ctx: PaymentWebhookContext,
  company: Company,
  event: Stripe.CustomerSubscriptionDeletedEvent,
) {
  return await new ProcessSubscriptionDeletedWorkflow(
    Queue.getInstance(),
    new CustomerInfoService(ctx.pgdb),
    new SubscriptionService(ctx.pgdb),
  ).run(company, event)
}
