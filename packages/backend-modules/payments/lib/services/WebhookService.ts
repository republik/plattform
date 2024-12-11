import { PgDb } from 'pogi'
import { WebhookArgs, WebhookRepo } from '../database/WebhookRepo'
import { getConfig } from '../config'
import { PaymentProvider } from '../providers/provider'
import { Webhook } from '../types'
import assert from 'node:assert'

export class WebhookService {
  #repo: WebhookRepo

  constructor(pgdb: PgDb) {
    this.#repo = new WebhookRepo(pgdb)
  }

  getEvent<T>(id: string) {
    return this.#repo.findWebhookEventBySourceId<T>(id)
  }

  logEvent<T>(webhook: WebhookArgs<T>): Promise<Webhook<T>> {
    return this.#repo.insertWebhookEvent(webhook)
  }

  markEventAsProcessed(id: string) {
    return this.#repo.updateWebhookEvent(id, {
      processed: true,
    })
  }

  verifyWebhook<T>(company: string, req: any): T {
    let whsec
    switch (company) {
      case 'PROJECT_R':
        whsec = getConfig().PROJECT_R_STRIPE_ENDPOINT_SECRET
        break
      case 'REPUBLIK':
        whsec = getConfig().REPUBLIK_STRIPE_ENDPOINT_SECRET
        break
      default:
        throw Error(`Unsupported company ${company}`)
    }

    assert(
      typeof whsec === 'string',
      `Webhook secret for ${company} is not configured`,
    )

    const event = PaymentProvider.forCompany(company).verifyWebhook<T>(
      req,
      whsec,
    )

    return event
  }
}
