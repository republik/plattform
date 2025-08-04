import { sendMailTemplate } from '@orbiting/backend-modules-mail'
import { t } from '@orbiting/backend-modules-translate'

import { PgDb } from 'pogi'
import {
  Invoice,
  PaymentMethod,
  Subscription,
  SubscriptionType,
} from '../types'
import type Stripe from 'stripe'
import { getConfig } from '../config'
import { PaymentService } from '../services/PaymentService'

type MergeVariable = { name: string; content: string | boolean }

type SendSetupSubscriptionMailArgs = {
  subscription: Subscription
  invoice: Invoice
  email: string
}

const CONFIG = getConfig()

const SUBSCRIPTION_PRODUCTS = [
  CONFIG.BENEFACTOR_SUBSCRIPTION_STRIPE_PRODUCT_ID,
  CONFIG.YEARLY_SUBSCRIPTION_STRIPE_PRODUCT_ID,
  CONFIG.MONTHLY_SUBSCRIPTION_STRIPE_PRODUCT_ID,
]

const DONATION_PRODUCTS = [CONFIG.PROJECT_R_DONATION_PRODUCT_ID]

export async function sendSetupSubscriptionMail(
  { subscription, invoice, email }: SendSetupSubscriptionMailArgs,
  pgdb: PgDb,
) {
  const subscriptionItem: Stripe.InvoiceItem = invoice.items.find(
    (i: Stripe.InvoiceItem) => {
      if (i.price?.product && typeof i.price.product === 'string') {
        return SUBSCRIPTION_PRODUCTS.includes(i.price?.product)
      }
      return false
    },
  )
  const donationItem: Stripe.InvoiceItem = invoice.items.find(
    (i: Stripe.InvoiceItem) => {
      if (i.price?.product && typeof i.price.product === 'string') {
        return DONATION_PRODUCTS.includes(i.price?.product)
      }
      return false
    },
  )

  const globalMergeVars: MergeVariable[] = [
    {
      name: 'total_before_discount',
      content: (invoice.totalBeforeDiscount / 100).toFixed(2),
    },
    { name: 'total', content: (invoice.total / 100).toFixed(2) },
    {
      name: 'subscription_total_before_discount',
      content: (subscriptionItem.amount / 100).toFixed(2),
    },
  ]

  if (subscriptionItem) {
    globalMergeVars.push({
      name: 'subscription_total_before_discount',
      content: (subscriptionItem.amount / 100).toFixed(2),
    })
  }

  if (donationItem && donationItem.price?.recurring) {
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

  if (invoice.discounts.length > 0 && invoice.totalDiscountAmount) {
    const discount = invoice.discounts[0] as any
    globalMergeVars.push(
      { name: 'discount_code', content: discount.coupon.name },
      {
        name: 'discount_total',
        content: (invoice.totalDiscountAmount / 100).toFixed(2),
      },
    )
  }

  const nextInvoice = await new PaymentService().getInvoicePreview(
    subscription.company,
    subscription.externalId,
  )

  if (!nextInvoice) {
    throw Error('Next invoice not found')
  }

  globalMergeVars.push({
    name: 'next_total',
    content: (nextInvoice.total / 100).toFixed(2),
  })

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
  paymentAttemptDate: Date
  paymentMethod?: PaymentMethod
}

export async function sendPaymentFailedNoticeMail(
  {
    subscription,
    invoice,
    email,
    paymentAttemptDate,
    paymentMethod,
  }: SendPaymentFailedNoticeMailArgs,
  pgdb: PgDb,
) {
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  const globalMergeVars: MergeVariable[] = [
    {
      name: 'total',
      content: (invoice.total / 100).toString(),
    },
    {
      name: 'payment_attempt_date',
      content: paymentAttemptDate.toLocaleDateString('de-CH', dateOptions),
    },
    {
      name: 'has_payment_method',
      content: !!paymentMethod,
    },
    {
      name: 'payment_method_name',
      content: paymentMethod?.method || 'NOT_FOUND',
    },
    {
      name: 'is_credit_card',
      content: !!paymentMethod?.last4 || false,
    },
    {
      name: 'credit_card_last4',
      content: paymentMethod?.last4 || '',
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

type SendRenewalPaymentSuccessfulNoticeMailArgs = {
  email: string
  subscription: Subscription
  amount: number
  paymentMethod: PaymentMethod
}

export async function sendRenewalPaymentSuccessfulNoticeMail(
  {
    email,
    subscription,
    amount,
    paymentMethod,
  }: SendRenewalPaymentSuccessfulNoticeMailArgs,
  pgdb: PgDb,
) {
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  const globalMergeVars: MergeVariable[] = [
    {
      name: 'total',
      content: (amount / 100).toString(),
    },
    {
      name: 'renewal_date',
      content: subscription.currentPeriodEnd.toLocaleDateString(
        'de-CH',
        dateOptions,
      ),
    },
    {
      name: 'payment_method_name',
      content: paymentMethod.method,
    },
    {
      name: 'is_credit_card',
      content: !!paymentMethod.last4,
    },
    {
      name: 'credit_card_last4',
      content: paymentMethod.last4 || '',
    },
  ]

  const templateName = subscription.type === 'MONTHLY_SUBSCRIPTION' ? 'subscription_renewal_payment_successful_monthly' : 'subscription_renewal_payment_successful'
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

type SendRenewalNoticeMailArgs = {
  email: string
  subscription: Subscription
  amount: number
  paymentAttemptDate: Date
  paymentMethod: PaymentMethod
}

export async function sendRenewalNoticeMail(
  {
    email,
    subscription,
    amount,
    paymentAttemptDate,
    paymentMethod,
  }: SendRenewalNoticeMailArgs,
  pgdb: PgDb,
) {
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  const globalMergeVars: MergeVariable[] = [
    {
      name: 'total',
      content: (amount / 100).toString(),
    },
    {
      name: 'renewal_date',
      content: subscription.currentPeriodEnd.toLocaleDateString(
        'de-CH',
        dateOptions,
      ),
    },
    {
      name: 'payment_attempt_date',
      content: paymentAttemptDate.toLocaleDateString('de-CH', dateOptions),
    },
    {
      name: 'payment_method_name',
      content: paymentMethod.method,
    },
    {
      name: 'is_credit_card',
      content: !!paymentMethod.last4,
    },
    {
      name: 'credit_card_last4',
      content: paymentMethod.last4 || '',
    },
  ]

  const templateName = 'subscription_renewal_notice_7_days'
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
