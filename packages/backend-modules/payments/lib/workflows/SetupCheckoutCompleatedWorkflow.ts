import Stripe from 'stripe'
import { Company, MailNotifier, PaymentWorkflow } from '../types'
import { PaymentService } from '../services/PaymentService'
import { SubscriptionService } from '../services/SubscriptionService'
import { CustomerInfoService } from '../services/CustomerInfoService'
import { UpgradeService } from '../services/UpgradeService'
import { Logger } from '@orbiting/backend-modules-types'
import { Upgrade } from '../database/SubscriptionUpgradeRepo'
import { UpgradeNotifierArgs } from '../email-notifieres/UpgradeEmail'

export class SetupWorkflow
  implements PaymentWorkflow<Stripe.CheckoutSessionCompletedEvent>
{
  constructor(
    private readonly paymentService: PaymentService,
    private readonly subscriptionService: SubscriptionService,
    private readonly customerInfoService: CustomerInfoService,
    private readonly upgradeService: UpgradeService,
    private readonly logger: Logger,
    private readonly notifiers: Record<
      'upgrade',
      MailNotifier<UpgradeNotifierArgs>
    >,
  ) {}
  async run(
    company: Company,
    event: Stripe.CheckoutSessionCompletedEvent,
  ): Promise<any> {
    this.logger.debug({ company, eventMeta: event.id }, 'Event received')

    try {
      const upgradeRef = this.getUpgradeRef(event.data.object.metadata)

      if (!upgradeRef || !upgradeRef.upgradeId) {
        throw new Error('Upgrade ref missing')
      }

      const res = await this.upgradeService.nonInteractiveSubscriptionUpgrade(
        upgradeRef?.upgradeId,
      )

      await this.runNotifieres(company, event, res)

      this.logger.debug(res, 'upgrade scheduled')
    } catch (e) {
      this.logger.debug(
        { error: e },
        'error handling subscription upgrade order',
      )
      throw e
    }

    return
  }

  private getUpgradeRef(metadata: Stripe.Metadata | null): {
    upgradeId: string
  } | null {
    if (!metadata) return null

    return { upgradeId: metadata['republik:upgrade:ref'] }
  }

  private async runNotifieres(
    company: Company,
    event: Stripe.CheckoutSessionCompletedEvent,
    upgrade: Upgrade,
  ) {
    const customerId = event.data.object.customer! as string
    const user = await this.customerInfoService.getUserForCompanyCustomer(
      company,
      customerId,
    )
    if (!user) {
      throw Error('Unexpected error: User does not exist')
    }

    const current = await this.subscriptionService.getSubscription({
      id: upgrade.subscriptionId!,
    })
    if (!current) {
      throw Error('Unexpected error: Current subscription does not exist')
    }

    this.logger.debug({ company, event: event.id, email: user.email })

    const invoice =
      await this.paymentService.getScheduledSubscriptionInvoicePreview(
        company,
        upgrade.externalId,
      )

    return this.notifiers['upgrade'].sendEmail(user.email, {
      company: company,
      currentSubscription: current,
      upgrade: upgrade,
      invoice: invoice,
    })
  }
}
