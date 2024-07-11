import { Queue } from '@orbiting/backend-modules-job-queue'
import { CustomerRepo, PaymentWebhookRepo } from '../../lib/database/repo'
import { PaymentGateway } from '../../lib/gateway/gateway'
import { Company } from '../../lib/types'
import { StripeWebhookWorker } from '../../lib/workers/StripeWebhookWorker'
import { ProjectRStripe, RepublikAGStripe } from '../../lib/gateway/stripe'
import type { Request, Response } from 'express'
import Stripe from 'stripe'

const Gateway = new PaymentGateway(
  {
    project_r: ProjectRStripe,
    republik_ag: RepublikAGStripe,
  },
  {} as CustomerRepo,
)

export async function handleStripeWebhook(
  repo: PaymentWebhookRepo,
  req: Request,
  res: Response,
) {
  const account = req.params['company'] as Company

  try {
    const event = Gateway.forCompany(account).verifyWebhook<Stripe.Event>(req)
    const e = await repo.logWebhookEvent<Stripe.Event>({
      source: 'stripe',
      sourceId: event.id,
      payload: event,
    })

    await Queue.getInstance().send<StripeWebhookWorker>(
      'payment:stripe:webhook',
      {
        event: e,
      },
    )
    return res.sendStatus(200)
  } catch (err) {
    console.log(
      `Webhook signature verification failed.`,
      (err as Error).message,
    )
    return res.sendStatus(400)
  }

  res.sendStatus(500)
}
