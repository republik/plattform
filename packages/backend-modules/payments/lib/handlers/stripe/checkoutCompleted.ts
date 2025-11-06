import Stripe from 'stripe'
import { Company } from '../../types'
import { GiftShop } from '../../shop/gifts'
import { PaymentWebhookContext } from '../../workers/StripeWebhookWorker'
import { CustomerInfoService } from '../../services/CustomerInfoService'
import { SubscriptionService } from '../../services/SubscriptionService'
import { InvoiceService } from '../../services/InvoiceService'
import { PaymentService } from '../../services/PaymentService'
import { UserService } from '../../services/UserService'
import { UpgradeService } from '../../services/UpgradeService'
import { SetupWorkflow } from '../../workflows/SetupCheckoutCompleatedWorkflow'
import { SubscriptionCheckoutCompletedWorkflow } from '../../workflows/SubscriptionCheckoutCompletedWorkflow'
import { Queue } from '@orbiting/backend-modules-job-queue'
import { OneTimePaymentCheckoutCompletedWorkflow } from '../../workflows/OneTimePaymentCheckoutCompletedWorkflow'
import { UpgradeSetupEmail } from '../../email-notifiers/UpgradeSetupEmail'
import { DonateEmail } from '../../email-notifiers/DontateEmail'
import { GiftCodeEmail } from '../../email-notifiers/GiftEmail'

export async function processCheckoutCompleted(
  ctx: PaymentWebhookContext,
  company: Company,
  event: Stripe.CheckoutSessionCompletedEvent,
) {
  switch (event.data.object.mode) {
    case 'setup': {
      return new SetupWorkflow(
        new PaymentService(),
        new SubscriptionService(ctx.pgdb),
        new CustomerInfoService(ctx.pgdb),
        new UpgradeService(ctx.pgdb, ctx.logger),
        ctx.logger.child(
          { eventId: event.id },
          { msgPrefix: '[Checkout SetupWorkflow]' },
        ),
        {
          upgrade: new UpgradeSetupEmail(ctx.pgdb),
        },
      ).run(company, event)
    }
    case 'subscription': {
      return new SubscriptionCheckoutCompletedWorkflow(
        new PaymentService(),
        new CustomerInfoService(ctx.pgdb),
        new SubscriptionService(ctx.pgdb),
        new InvoiceService(ctx.pgdb),
        Queue.getInstance(),
        ctx.logger.child(
          { eventId: event.id },
          { msgPrefix: '[Checkout SubscriptionWorkflow]' },
        ),
      ).run(company, event)
    }
    case 'payment': {
      return new OneTimePaymentCheckoutCompletedWorkflow(
        new PaymentService(),
        new GiftShop(ctx.pgdb, ctx.logger),
        new UserService(ctx.pgdb),
        new CustomerInfoService(ctx.pgdb),
        new InvoiceService(ctx.pgdb),
        {
          gift: new GiftCodeEmail(ctx.pgdb),
          donation: new DonateEmail(ctx.pgdb),
        },
      ).run(company, event)
    }
  }
}
