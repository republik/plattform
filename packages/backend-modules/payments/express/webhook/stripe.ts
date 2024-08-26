import { Queue } from '@orbiting/backend-modules-job-queue'
import { PaymentWebhookRepo } from '../../lib/database/repo'
import { PaymentGateway } from '../../lib/gateway/gateway'
import { Company } from '../../lib/types'
import { StripeWebhookWorker } from '../../lib/workers/StripeWebhookWorker'
import { ProjectRStripe, RepublikAGStripe } from '../../lib/gateway/stripe'
import type { Request, Response } from 'express'
import Stripe from 'stripe'
import assert from 'node:assert'

const Gateway = new PaymentGateway({
  PROJECT_R: ProjectRStripe,
  REPUBLIK: RepublikAGStripe,
})

export async function handleStripeWebhook(
  repo: PaymentWebhookRepo,
  req: Request,
  res: Response,
) {
  try {
    const company = getCompanyName(req.params['company'])
    const whsec = getWhsecForCompany(company)
    const event = Gateway.forCompany(company).verifyWebhook<Stripe.Event>(
      req,
      whsec,
    )

    if (!event.livemode && !process.env.STRIPE_TEST_MODE) {
      console.log('skipping test event in live mode')
      return res.sendStatus(304)
    }

    const e = await repo.logWebhookEvent<Stripe.Event>({
      source: 'stripe',
      sourceId: event.id,
      company: company,
      payload: event,
    })

    await Queue.getInstance().send<StripeWebhookWorker>(
      'payment:stripe:webhook',
      {
        $version: 'v1',
        event: e,
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

function getWhsecForCompany(company: Company) {
  let whsec
  switch (company) {
    case 'PROJECT_R':
      whsec = process.env.STRIPE_PLATFORM_ENDPOINT_SECRET
      break
    case 'REPUBLIK':
      whsec = process.env.STRIPE_CONNECTED_ENDPOINT_SECRET
      break
    default:
      throw Error(`Unsupported company ${company}`)
  }

  assert(
    typeof whsec === 'string',
    `Webhook secret for ${company} is not configured`,
  )

  return whsec
}
