import { PgDb } from 'pogi'
import { WebhookArgs, WebhookRepo } from '../database/WebhookRepo'
import { getConfig } from '../config'
import { Webhook } from '../types'
import assert from 'node:assert'
import { PaymentService } from './PaymentService'

export class WebhookService {
  #repo: WebhookRepo
  #paymentService: PaymentService

  constructor(pgdb: PgDb) {
    this.#repo = new WebhookRepo(pgdb)
    this.#paymentService = new PaymentService()
  }

  getEvent<T>(id: string): Promise<Webhook<T> | null> {
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

  verifyWebhook(company: string, req: any) {
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

    const event = this.#paymentService.verifyWebhook(company, req, whsec)

    return event
  }
}
