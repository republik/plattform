import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job } from 'pg-boss'
import { Webhook } from '../types'
import Stripe from 'stripe'

type WorkerArgs = {
  // TODO! Use webhook event id stead of entire webhook body
  event: Webhook<Stripe.Event>
}

export class StripeWebhookWorker extends BaseWorker<WorkerArgs> {
  readonly queue = 'payment:stripe:webhook'

  async perform(job: Job<WorkerArgs>): Promise<void> {
    console.log('event.data')
    const event = job.data.event.payload
    console.log(event.data)

    switch (event.type) {
      case 'checkout.session.completed':
        // TODO checkout completed
        console.log(event.data)
        throw new Error('Method not implemented.')
      case 'customer.subscription.updated':
        // TODO subscription updated
        console.log(event.data)
        throw new Error('Method not implemented.')
      case 'customer.subscription.deleted':
        // TODO scubription canceld
        console.log(event.data)
        throw new Error('Method not implemented.')
      default:
        throw new Error('Method not implemented.')
    }
  }
}
