import { PgDb } from 'pogi'
import { Company, WebhookSource, Webhook } from '../types'

export type WebhookArgs<T> = {
  source: WebhookSource
  company: Company
  sourceId: string
  payload: T
}

export type WebhookUpdateArgs<T> = {
  company?: Company
  sourceId?: string
  processed?: boolean
  payload?: T
}

export interface PaymentWebhookRepo {
  insertWebhookEvent<T>(webhook: WebhookArgs<T>): Promise<Webhook<T>>
  findWebhookEventBySourceId<T>(sourceId: string): Promise<Webhook<T> | null>
  updateWebhookEvent<T>(
    eventId: string,
    webhook: WebhookUpdateArgs<T>,
  ): Promise<Webhook<T>>
}

export class WebhookRepo implements PaymentWebhookRepo {
  #pgdb: PgDb
  constructor(dbConn: PgDb) {
    this.#pgdb = dbConn
  }

  insertWebhookEvent<T>(webhook: WebhookArgs<T>): Promise<Webhook<T>> {
    return this.#pgdb.payments.webhooks.insertAndGet({
      sourceId: webhook.sourceId,
      source: webhook.source,
      company: webhook.company,
      payload: webhook.payload,
      processed: false,
    })
  }

  updateWebhookEvent<T>(
    sourceId: string,
    webhook: WebhookUpdateArgs<T>,
  ): Promise<Webhook<T>> {
    return this.#pgdb.payments.webhooks.updateAndGet({ sourceId }, webhook)
  }

  findWebhookEventBySourceId<T>(sourceId: string): Promise<Webhook<T> | null> {
    return this.#pgdb.payments.webhooks.findOne({
      sourceId,
    })
  }

  getWebhookEvent<T>(id: string): Promise<Webhook<T>> {
    return this.#pgdb.payments.webhoook.findOne({
      id,
    })
  }
}
