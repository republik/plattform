import Stripe from 'stripe'
import type { Request, Response } from 'express'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { Company } from '../../lib/types'
import { StripeWebhookWorker } from '../../lib/workers/StripeWebhookWorker'
import { WebhookService } from '../../lib/services/WebhookService'
import { PgDb } from 'pogi'

export async function handleStripeWebhook(
  req: Request,
  res: Response,
  ctx: { pgdb: PgDb },
) {
  try {
    const webhookService = new WebhookService(ctx.pgdb)

    const company = getCompanyName(req.params['company'])
    const event = webhookService.verifyWebhook(company, req)

    if (!event.livemode && !isInStripeTestMode()) {
      req.log.info('skipping test event in live mode')
      return res.sendStatus(304)
    }

    const alreadySeen = await webhookService.getEvent<Stripe.Event>(event.id)

    if (alreadySeen) {
      // if we have already logged the webhook we can return
      const status = alreadySeen.processed ? 200 : 204
      return res.sendStatus(status)
    }

    const e = await webhookService.logEvent<Stripe.Event>({
      source: 'stripe',
      sourceId: event.id,
      company: company,
      payload: event,
    })

    await Queue.getInstance().send<StripeWebhookWorker>(
      'payments:stripe:webhook',
      {
        $version: 'v1',
        eventSourceId: e.sourceId,
        company: company,
      },
    )
    return res.sendStatus(202)
  } catch (err) {
    req.log.error({ error: err }, `Webhook signature verification failed.`)
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
