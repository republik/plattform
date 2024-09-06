import { Queue } from '@orbiting/backend-modules-job-queue'
import { Company } from '../../lib/types'
import { StripeWebhookWorker } from '../../lib/workers/StripeWebhookWorker'
import type { Request, Response } from 'express'
import Stripe from 'stripe'
import { Payments } from '../../lib/payments'

export async function handleStripeWebhook(req: Request, res: Response) {
  try {
    const payments = Payments.getInstance()

    const company = getCompanyName(req.params['company'])
    const event = payments.verifyWebhookForCompany<Stripe.Event>(company, req)

    if (!event.livemode && !isInStripeTestMode()) {
      console.log('skipping test event in live mode')
      return res.sendStatus(304)
    }

    const alreadySeen = await payments.findWebhookEventBySourceId<Stripe.Event>(
      event.id,
    )

    if (alreadySeen) {
      // if we have already logged the webhook we can retrun
      const status = alreadySeen.processed ? 200 : 204
      return res.sendStatus(status)
    }

    const e = await payments.logWebhookEvent<Stripe.Event>({
      source: 'stripe',
      sourceId: event.id,
      company: company,
      payload: event,
    })

    await Queue.getInstance().send<StripeWebhookWorker>(
      'payment:stripe:webhook',
      {
        $version: 'v1',
        eventSourceId: e.sourceId,
        company: company,
      },
    )
    return res.sendStatus(202)
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
    case 'republik':
      return 'REPUBLIK'
    default:
      throw Error(`Unsupported company ${pathSegment}`)
  }
}

function isInStripeTestMode() {
  return process.env.STRIPE_TEST_MODE || false
}
