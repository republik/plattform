import { BaseWorker } from '@orbiting/backend-modules-job-queue'
import { Job, SendOptions } from 'pg-boss'
import { Company } from '../types'
import Stripe from 'stripe'
import { processInvoiceUpdated } from '../handlers/stripe/invoiceUpdate'
import { processInvoiceCreated } from '../handlers/stripe/invoiceCreated'
import { processSubscriptionDeleted } from '../handlers/stripe/subscriptionDeleted'
import { processSubscriptionUpdate } from '../handlers/stripe/subscriptionUpdate'
import { processSubscriptionCreated } from '../handlers/stripe/subscriptionCreated'
import { processCheckoutCompleted } from '../handlers/stripe/checkoutCompleted'
import { processPaymentFailed } from '../handlers/stripe/paymentFailed'
import { processInvoiceUpcoming } from '../handlers/stripe/invoiceUpcoming'
import { isPledgeBased } from '../handlers/stripe/utils'
import { PgDb } from 'pogi'

async function isMigratedSubscription(
  pgdb: PgDb,
  subscriptionExternalId: string,
): Promise<boolean> {
  const row = await pgdb.queryOne(
    `SELECT id FROM payments.subscriptions WHERE "externalId" = :externalId`,
    { externalId: subscriptionExternalId },
  )
  return !!row
}
import { processChargeUpdated } from '../handlers/stripe/chargeUpdated'
import { processInvoicePaymentSucceeded } from '../handlers/stripe/invoicePaymentSucceeded'
import { WebhookService } from '../services/WebhookService'
import { ConnectionContext } from '@orbiting/backend-modules-types'
import { processChargeSucceeded } from '../handlers/stripe/chargeSucceeded'

type WorkerArgsV1 = {
  $version: 'v1'
  eventSourceId: string
  company: Company
}

export type PaymentWebhookContext = ConnectionContext

export class StripeWebhookWorker extends BaseWorker<WorkerArgsV1> {
  readonly queue = 'payments:stripe:webhook'
  readonly options: SendOptions = {
    retryLimit: 3,
    retryDelay: 120, // retry every 2 minutes
  }

  async perform([job]: Job<WorkerArgsV1>[]): Promise<void> {
    if (typeof this.context === 'undefined')
      throw Error('This jobs needs the connection context to run')

    const webhookService = new WebhookService(this.context.pgdb)

    const wh = await webhookService.getEvent<Stripe.Event>(
      job.data.eventSourceId,
    )

    if (!wh) {
      this.logger.error(
        { eventId: job.data.eventSourceId },
        'Webhook not found',
      )
      return await this.pgBoss.fail(this.queue, job.id)
    }

    const event = wh.payload
    try {
      this.logger.info(
        { eventId: event.id, eventType: event.type },
        'processing stripe event %s [%s]',
      )

      const ctx = this.context

      switch (event.type) {
        case 'checkout.session.completed':
          await processCheckoutCompleted(ctx, job.data.company, event)
          break
        case 'customer.subscription.created':
          if (isPledgeBased(event.data.object.metadata)) {
            this.logger.info(
              { eventId: event.id },
              'pledge based event; skipping',
            )
            break
          }
          await processSubscriptionCreated(ctx, job.data.company, event)
          break
        case 'customer.subscription.updated':
          if (isPledgeBased(event.data.object.metadata)) {
            if (
              !(await isMigratedSubscription(ctx.pgdb, event.data.object.id))
            ) {
              this.logger.info(
                { eventId: event.id },
                'pledge based, not yet migrated; skipping',
              )
              break
            }
          }
          await processSubscriptionUpdate(ctx, job.data.company, event)
          break
        case 'customer.subscription.deleted':
          if (isPledgeBased(event.data.object.metadata)) {
            if (
              !(await isMigratedSubscription(ctx.pgdb, event.data.object.id))
            ) {
              this.logger.info(
                { eventId: event.id },
                'pledge based, not yet migrated; skipping',
              )
              break
            }
          }
          await processSubscriptionDeleted(ctx, job.data.company, event)
          break
        case 'invoice.created':
          await processInvoiceCreated(ctx, job.data.company, event)
          break
        case 'invoice.updated':
        case 'invoice.finalized':
        case 'invoice.paid':
        case 'invoice.voided':
          await processInvoiceUpdated(ctx, job.data.company, event)
          break
        case 'invoice.payment_failed':
          await processPaymentFailed(ctx, job.data.company, event)
          break
        case 'invoice.payment_succeeded':
          await processInvoicePaymentSucceeded(ctx, job.data.company, event)
          break
        case 'invoice.upcoming':
          await processInvoiceUpcoming(ctx, job.data.company, event)
          break
        case 'charge.succeeded':
          if (isPledgeBased(event.data.object.metadata)) {
            // Recurring charges have empty metadata — resolve subscription via invoice
            const invoiceId = (event.data.object as Stripe.Charge).invoice
            let migrated = false
            if (invoiceId) {
              const stripeInvoice = await ctx.pgdb
                .queryOne(
                  `SELECT id FROM payments.invoices WHERE "externalId" = :externalId`,
                  { externalId: invoiceId },
                )
                .then((r: any) => r)
              migrated = !!stripeInvoice
              if (!migrated) {
                // Invoice not in our DB yet — check Stripe to get the subscription ID
                // This handles the edge case where charge.succeeded arrives before
                // invoice.payment_succeeded has written the invoice row.
                const stripe = require('../providers/stripe').RepublikAGStripe as Stripe
                const si = await stripe.invoices.retrieve(invoiceId as string).catch(() => null)
                if (si?.parent?.subscription_details?.subscription) {
                  migrated = await isMigratedSubscription(
                    ctx.pgdb,
                    si.parent.subscription_details.subscription as string,
                  )
                }
              }
            }
            if (!migrated) {
              this.logger.info(
                { eventId: event.id },
                'pledge based charge, not yet migrated; skipping',
              )
              break
            }
          }
          await processChargeSucceeded(ctx, job.data.company, event)
          break
        case 'charge.refunded':
        case 'charge.updated':
        case 'charge.failed':
        case 'charge.expired':
        case 'charge.captured':
          await processChargeUpdated(ctx, job.data.company, event)
          break
        default:
          this.logger.debug(
            { eventId: event.id, eventType: event.type },
            'skipping webhook event; no handler for this event',
          )
      }
    } catch (e) {
      this.logger.error(
        {
          eventId: event.id,
          eventType: event.type,
          error: e,
        },
        'processing stripe event failed',
      )

      throw e
    }

    this.logger.info(
      { eventId: event.id, eventType: event.type },
      'successfully processed stripe event',
    )
    await webhookService.markEventAsProcessed(event.id)
  }
}
