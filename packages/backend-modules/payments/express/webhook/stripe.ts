import { Queue } from '@orbiting/backend-modules-job-queue'
import { PaymentWebhookRepo } from '../../lib/database/repo'
import { PaymentGateway } from '../../lib/gateway/gateway'
import { Company } from '../../lib/types'
import { StripeWebhookWorker } from '../../lib/workers/StripeWebhookWorker'
import { ProjectRStripe, RepublikAGStripe } from '../../lib/gateway/stripe'
import type { Request, Response } from 'express'
import Stripe from 'stripe'

const Gateway = new PaymentGateway({
  PROJECT_R: ProjectRStripe,
  REPUBLIK_AG: RepublikAGStripe,
})

export async function handleStripeWebhook(
  repo: PaymentWebhookRepo,
  req: Request,
  res: Response,
) {
  try {
    const account = getCompanyName(req.params['company'])
    const event = Gateway.forCompany(account).verifyWebhook<Stripe.Event>(req)
    const e = await repo.logWebhookEvent<Stripe.Event>({
      source: 'stripe',
      sourceId: event.id,
      payload: event,
    })

    await Queue.getInstance().send<StripeWebhookWorker>(
      'payment:stripe:webhook',
      {
        $version: 'v1',
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
}

function getCompanyName(pathSegment: string): Company {
  switch (pathSegment) {
    case 'project-r':
    case 'project_r':
      return 'PROJECT_R'
    case 'republik-ag':
    case 'republik_ag':
      return 'REPUBLIK_AG'
    default:
      throw Error(`Unsupported company ${pathSegment}`)
  }
}
