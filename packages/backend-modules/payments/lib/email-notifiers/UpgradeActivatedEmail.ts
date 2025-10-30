import { PgDb } from 'pogi'
import { Company, MailNotifier, SubscriptionType } from '../types'
import { Upgrade } from '../database/SubscriptionUpgradeRepo'
import Stripe from 'stripe'

import { sendMailTemplate } from '@orbiting/backend-modules-mail'
import { t } from '@orbiting/backend-modules-translate'
import { PaymentService } from '../services/PaymentService'
import { DONATION_PRODUCTS, SUBSCRIPTION_PRODUCTS } from '../constants'
import { MergeVariable } from '../transactionals/sendTransactionalMails'

export type UpgradeActivatedNotifierArgs = {
  company: Company
  upgrade: Upgrade
  subscriptionId: string
}

export class UpgradeActivatedEmail
  implements MailNotifier<UpgradeActivatedNotifierArgs>
{
  readonly templateNameBase = 'subscription_upgrade_activated'

  constructor(
    protected readonly pgdb: PgDb,
    protected readonly paymentService: PaymentService,
  ) {}

  async sendEmail(email: string, args: UpgradeActivatedNotifierArgs) {
    const templateName = `${
      this.templateNameBase
    }_${this.subscriptionTypeBaseName(args.upgrade.subscriptionType!)}`

    const invoice = await this.getInvoiceData(args.company, args.upgrade)
    if (!invoice) {
      throw new Error('Invoice does not exist')
    }

    const { subscriptionItem, donationItem } = this.getItems(invoice)

    const globalMergeVars: MergeVariable[] = await this.getVariables(
      args.company,
      args.subscriptionId,
      invoice,
      subscriptionItem,
      donationItem,
    )

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

  private async getVariables(
    company: Company,
    subscriptionId: string,
    invoice: Stripe.Response<Stripe.Invoice>,
    subscriptionItem: Stripe.InvoiceLineItem | undefined,
    donationItem: Stripe.InvoiceLineItem | undefined,
  ) {
    const globalMergeVars: MergeVariable[] = [
      {
        name: 'total_before_discount',
        content: (invoice.subtotal / 100).toFixed(2),
      },
      {
        name: 'total',
        content: (invoice.total! / 100).toFixed(2),
      },
    ]

    if (subscriptionItem) {
      globalMergeVars.push({
        name: 'subscription_total_before_discount',
        content: (subscriptionItem.amount / 100).toFixed(2),
      })
    }

    if (donationItem) {
      const priceId = donationItem.pricing!.price_details!.price!
      const dontationPrice = await this.paymentService.getPrice(
        company,
        priceId,
      )
      if (dontationPrice) {
        globalMergeVars.push({
          name: 'recurring_donation',
          content: (donationItem.amount / 100).toFixed(2),
        })
      } else if (donationItem) {
        globalMergeVars.push({
          name: 'onetime_donation',
          content: (donationItem.amount / 100).toFixed(2),
        })
      }
    }

    if (invoice.discounts.length > 0 && invoice.total_discount_amounts) {
      const discount = invoice.discounts[0] as any
      const duration = discount.coupon.duration
      const duration_in_months = discount.coupon.duration_in_months

      globalMergeVars.push(
        { name: 'discount_code', content: discount.coupon.name },
        {
          name: 'discount_total',
          content: (
            (invoice.total_discount_amounts.reduce(
              (acc, value) => acc + value.amount,
              0,
            ) || 0) / 100
          ).toFixed(2),
        },
        {
          name: 'discount_duration_forever',
          content: duration === 'forever',
        },
        {
          name: 'discount_duration_repeating',
          content: duration === 'repeating',
        },
        {
          name: 'discount_duration_once',
          content: duration === 'once',
        },
        {
          name: 'discount_duration_in_months',
          content: duration_in_months,
        },
        {
          name: 'discount_duration_display_in_months',
          content: t.pluralize(
            'api/payments/dicsount_duration_display_months',
            {
              months: duration_in_months,
              count: duration_in_months,
            },
          ),
        },
        {
          name: 'discount_duration_display',
          content: [
            duration_in_months / 12 > 0 &&
              t.pluralize('api/payments/dicsount_duration_display_years', {
                years: Math.floor(duration_in_months / 12),
                count: Math.floor(duration_in_months / 12),
              }),
            duration_in_months / 12 > 0 && duration_in_months % 12 > 0 && 'und',
            duration_in_months % 12 > 0 &&
              t.pluralize('api/payments/dicsount_duration_display_months', {
                months: duration_in_months % 12,
                count: duration_in_months % 12,
              }),
          ]
            .filter(Boolean)
            .join(' '),
        },
      )
    }

    const nextInvoice = await this.paymentService.getInvoicePreview(
      company,
      subscriptionId,
    )

    if (!nextInvoice) {
      throw Error('Next invoice not found')
    }

    globalMergeVars.push({
      name: 'next_total',
      content: (nextInvoice.total / 100).toFixed(2),
    })
    return globalMergeVars
  }

  private async getInvoiceData(company: Company, upgrade: Upgrade) {
    const sub = await this.paymentService.getSubscription(
      company,
      upgrade.externalId,
    )
    if (typeof sub?.latest_invoice !== 'string') {
      throw new Error('Invalid invoice reference')
    }

    return this.paymentService.getInvoice('PROJECT_R', sub?.latest_invoice)
  }

  private getItems(invoice: Stripe.Invoice) {
    const subscriptionItem: Stripe.InvoiceLineItem | undefined =
      invoice.lines.data.find((i: Stripe.InvoiceLineItem) => {
        if (
          i.pricing?.price_details?.product &&
          typeof i.pricing?.price_details?.product === 'string'
        ) {
          return SUBSCRIPTION_PRODUCTS.includes(
            i.pricing?.price_details?.product,
          )
        }
        return false
      })
    const donationItem: Stripe.InvoiceLineItem | undefined =
      invoice.lines.data.find((i: Stripe.InvoiceLineItem) => {
        if (
          i.pricing?.price_details?.product &&
          typeof i.pricing?.price_details?.product === 'string'
        ) {
          return DONATION_PRODUCTS.includes(i.pricing?.price_details?.product)
        }
        return false
      })

    return { subscriptionItem, donationItem }
  }

  private subscriptionTypeBaseName(type: SubscriptionType): string {
    return type.replace(/_.*/, '')
  }
}
