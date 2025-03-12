import { sendMailTemplate } from '@orbiting/backend-modules-mail'
import { t } from '@orbiting/backend-modules-translate'

import { PgDb } from 'pogi'
import { Invoice, Subscription, SubscriptionType } from '../types'
import type Stripe from 'stripe'

type MergeVariable = { name: string; content: string | boolean }

type SendSetupSubscriptionMailArgs = {
  subscription: Subscription
  invoice: Invoice
  email: string
}

export async function sendSetupSubscriptionMail(
  { subscription, invoice, email }: SendSetupSubscriptionMailArgs,
  pgdb: PgDb,
) {
  const globalMergeVars: MergeVariable[] = [
    {
      name: 'total_before_discount',
      content: (invoice.totalBeforeDiscount / 100).toString(),
    },
    { name: 'total', content: (invoice.total / 100).toString() },
    {
      name: 'order_items',
      content: invoice.items?.map((item: Stripe.InvoiceItem) => {
        return {
          description: item.price?.lookup_key
            ? t(`api/payments/price/${item.price.lookup_key}`, null, 'Spende')
            : null,
          amount: (item.amount / 100).toString(),
        }
      }),
    },
  ]
  if (invoice.discounts.length > 0 && invoice.totalDiscountAmount) {
    const discount = invoice.discounts[0] as any
    globalMergeVars.push(
      { name: 'discount_code', content: discount.coupon.name },
      {
        name: 'discount_total',
        content: (invoice.totalDiscountAmount / 100).toString(),
      },
    )
  }

  const templateName = 'subscription_created_' + subscription.type.toLowerCase()
  const sendMailResult = await sendMailTemplate(
    {
      to: email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS as string,
      subject: t(`api/email/${templateName}/subject`),
      templateName,
      mergeLanguage: 'handlebars',
      globalMergeVars,
    },
    { pgdb },
  )

  return sendMailResult
}

type SendCancelConfirmationMailArgs = {
  endDate: Date
  cancellationDate: Date
  type: SubscriptionType
  userId: string
  email: string
}

export async function sendCancelConfirmationMail(
  {
    endDate,
    cancellationDate,
    type,
    userId,
    email,
  }: SendCancelConfirmationMailArgs,
  pgdb: PgDb,
) {
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  const globalMergeVars: MergeVariable[] = [
    {
      name: 'end_date',
      content: endDate.toLocaleDateString('de-CH', dateOptions),
    },
    {
      name: 'is_yearly',
      content: type === 'YEARLY_SUBSCRIPTION',
    },
    {
      name: 'is_monthly',
      content: type === 'MONTHLY_SUBSCRIPTION',
    },
  ]

  const templateName = 'subscription_cancel_notice'
  const sendMailResult = await sendMailTemplate(
    {
      to: email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS as string,
      subject: t(`api/email/${templateName}/subject`),
      templateName,
      mergeLanguage: 'handlebars',
      globalMergeVars,
    },
    { pgdb },
    {
      onceFor: {
        type: templateName,
        userId,
        keys: [`cancellationDate:${cancellationDate.valueOf()}`],
      },
    },
  )

  return sendMailResult
}

type SendRevokeCancellationConfirmationMailArgs = {
  currentEndDate: Date
  revokedCancellationDate: Date
  type: SubscriptionType
  userId: string
  email: string
}

export async function sendRevokeCancellationConfirmationMail(
  {
    currentEndDate,
    revokedCancellationDate,
    type,
    userId,
    email,
  }: SendRevokeCancellationConfirmationMailArgs,
  pgdb: PgDb,
) {
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  const globalMergeVars: MergeVariable[] = [
    {
      name: 'renew_date',
      content: currentEndDate.toLocaleDateString('de-CH', dateOptions),
    },
    {
      name: 'is_yearly',
      content: type === 'YEARLY_SUBSCRIPTION',
    },
    {
      name: 'is_monthly',
      content: type === 'MONTHLY_SUBSCRIPTION',
    },
  ]

  const templateName = 'subscription_revoke_cancellation_notice'
  const sendMailResult = await sendMailTemplate(
    {
      to: email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS as string,
      subject: t(`api/email/${templateName}/subject`),
      templateName,
      mergeLanguage: 'handlebars',
      globalMergeVars,
    },
    { pgdb },
    {
      onceFor: {
        type: templateName,
        userId,
        keys: [`revokedCancellationDate:${revokedCancellationDate.valueOf()}`],
      },
    },
  )

  return sendMailResult
}

type SendEndedNoticeMailArgs = {
  subscription: Subscription
  cancellationReason: string | undefined
  email: string
}

export async function sendEndedNoticeMail(
  { subscription, cancellationReason, email }: SendEndedNoticeMailArgs,
  pgdb: PgDb,
) {
  if (!subscription) {
    console.log('did not find subscription, not sending transactional mail')
    return
  }

  const isAutomaticOverdueCancel = cancellationReason === 'payment_failed' // add this when invoice handling is implemented: !['paid', 'void', 'refunded'].includes(latestInvoiceStatus)

  const globalMergeVars: MergeVariable[] = [
    {
      name: 'is_automatic_overdue_cancel',
      content: isAutomaticOverdueCancel,
    },
  ]

  const templateName = 'subscription_ended_' + subscription.type.toLowerCase()
  const sendMailResult = await sendMailTemplate(
    {
      to: email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS as string,
      subject: t(`api/email/${templateName}/subject`),
      templateName,
      mergeLanguage: 'handlebars',
      globalMergeVars,
    },
    { pgdb },
  )

  return sendMailResult
}

type SendPaymentFailedNoticeMailArgs = {
  subscription: Subscription
  invoice: Invoice
  email: string
}

export async function sendPaymentFailedNoticeMail(
  { subscription, invoice, email }: SendPaymentFailedNoticeMailArgs,
  pgdb: PgDb,
) {
  const globalMergeVars: MergeVariable[] = [
    {
      name: 'total',
      content: (invoice.total / 100).toString(),
    },
  ]

  const templateName =
    'subscription_payment_failed_notice_' + subscription.type.toLowerCase()
  const sendMailResult = await sendMailTemplate(
    {
      to: email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS as string,
      subject: t(`api/email/${templateName}/subject`),
      templateName,
      mergeLanguage: 'handlebars',
      globalMergeVars,
    },
    { pgdb },
  )

  return sendMailResult
}

export async function sendGiftPurchaseMail(
  { voucherCode, email }: { voucherCode: string; email: string },
  pgdb: PgDb,
) {
  const globalMergeVars: MergeVariable[] = [
    {
      name: 'voucher_codes',
      content: voucherCode,
    },
  ]

  const templateName = 'payment_successful_gift_voucher'
  const sendMailResult = await sendMailTemplate(
    {
      to: email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS as string,
      subject: t(`api/email/${templateName}/subject`),
      templateName,
      mergeLanguage: 'handlebars',
      globalMergeVars,
    },
    { pgdb },
  )

  return sendMailResult
}

export async function sendSetupGiftMail(
  { email }: { email: string },
  pgdb: PgDb,
) {
  const globalMergeVars: MergeVariable[] = []

  const templateName = 'subscription_created_gift_subscription'
  const sendMailResult = await sendMailTemplate(
    {
      to: email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS as string,
      subject: t(`api/email/${templateName}/subject`),
      templateName,
      mergeLanguage: 'handlebars',
      globalMergeVars,
    },
    { pgdb },
  )

  return sendMailResult
}

export async function sendConfirmGiftAppliedMail(
  {
    email,
    subscriptionType,
  }: { email: string; subscriptionType: SubscriptionType },
  pgdb: PgDb,
) {
  const globalMergeVars: MergeVariable[] = [
    {
      name: 'is_monthly',
      content: subscriptionType === 'MONTHLY_SUBSCRIPTION',
    },
    {
      name: 'is_yearly',
      content: subscriptionType === 'YEARLY_SUBSCRIPTION',
    },
  ]

  const templateName = 'subscription_updated_gift_voucher_subscription'
  const sendMailResult = await sendMailTemplate(
    {
      to: email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS as string,
      subject: t(`api/email/${templateName}/subject`),
      templateName,
      mergeLanguage: 'handlebars',
      globalMergeVars,
    },
    { pgdb },
  )

  return sendMailResult
}
