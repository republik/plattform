import { sendMailTemplate } from '@orbiting/backend-modules-mail'
import { t } from '@orbiting/backend-modules-translate'

import { PgDb } from 'pogi'
import { Invoice, Order, Subscription } from '../types'

type MergeVariable = { name: string; content: string | boolean }

export async function sendSetupSubscriptionMail(
  subscription: Subscription,
  order: Order,
  email: string,
  pgdb: PgDb,
) {
  if (!subscription || !order) {
    console.log(
      'No subscription or order found, not sending transactional mail',
    )
    return
  }

  const globalMergeVars: MergeVariable[] = [
    {
      name: 'total_before_discount',
      content: (order.totalBeforeDiscount / 100).toString(),
    },
    { name: 'total', content: (order.total / 100).toString() },
  ]
  if (order.discountCode && order.discountTotal) {
    globalMergeVars.push(
      { name: 'discount_code', content: order.discountCode },
      { name: 'discount_total', content: (order.discountTotal / 100).toString() },
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


export async function sendCancelConfirmationMail(endDate: Date, email: string, pgdb: PgDb) {
  const globalMergeVars: MergeVariable[] = [
    {
      name: 'end_date',
      content: endDate.toLocaleDateString(),
    }
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
    { pgdb }
  )

  return sendMailResult
}

export async function sendEndedNoticeMail(subscription: Subscription, cancellationReason: string | undefined, email: string, pgdb: PgDb) {
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
    { pgdb }
  )

  return sendMailResult
}

export async function sendPaymentFailedNoticeMail(subscription: Subscription, invoice: Invoice, email: string, pgdb: PgDb) {

  const globalMergeVars: MergeVariable[] = [
    {
      name: 'total',
      content: (invoice.total / 100).toString(),
    },
  ]

  const templateName = 'subscription_payment_failed_notice_' + subscription.type.toLowerCase()
  const sendMailResult = await sendMailTemplate(
    {
      to: email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS as string,
      subject: t(`api/email/${templateName}/subject`),
      templateName,
      mergeLanguage: 'handlebars',
      globalMergeVars,
    },
    { pgdb }
  )

  return sendMailResult
}
