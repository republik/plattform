import { PgDb } from 'pogi'
import { Company, MailNotifier, Subscription, SubscriptionType } from '../types'
import { Upgrade } from '../database/SubscriptionUpgradeRepo'
import Stripe from 'stripe'

import { sendMailTemplate } from '@orbiting/backend-modules-mail'
import { t } from '@orbiting/backend-modules-translate'

export type UpgradeNotifierArgs = {
  company: Company
  currentSubscription: Subscription
  upgrade: Upgrade
  invoice: Stripe.Invoice
}

export class UpgradeSetupEmail implements MailNotifier<UpgradeNotifierArgs> {
  readonly templateNameBase = 'subscription_setup_successful_upgrade'

  constructor(protected readonly pgdb: PgDb) {}

  async sendEmail(email: string, args: UpgradeNotifierArgs) {
    const templateName = `${
      this.templateNameBase
    }_${this.subscriptionTypeBaseName(args.upgrade.subscriptionType!)}`

    const globalMergeVars = [
      {
        name: 'total',
        content: (args.invoice.total! / 100).toFixed(2),
      },
      {
        name: 'current_abo_name',
        content: t(
          `api/payments/subscription_type/${args.currentSubscription.type}`,
        ),
      },
      {
        name: 'next_abo_name',
        content: t(
          `api/payments/subscription_type/${args.upgrade.subscriptionType}`,
        ),
      },
      {
        name: 'start_date',
        content: args.upgrade.scheduledStart.toLocaleDateString('de-CH'),
      },
    ]

    const sendMailResult = await sendMailTemplate(
      {
        to: email,
        fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS as string,
        subject: t(
          `api/email/${templateName}/${args.upgrade.subscriptionType}/subject`,
        ),
        templateName: templateName,
        mergeLanguage: 'handlebars',
        globalMergeVars,
      },
      { pgdb: this.pgdb },
    )

    return sendMailResult
  }

  private subscriptionTypeBaseName(type: SubscriptionType): string {
    return type.replace(/_.*/, '')
  }
}
