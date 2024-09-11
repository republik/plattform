import { sendMailTemplate } from '@orbiting/backend-modules-mail'
import { t } from '@orbiting/backend-modules-translate'

import { PgDb } from 'pogi'
import { Order, Subscription } from '../types'

type MergeVariable = { name: string; content: string }

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
      content: order.totalBeforeDiscount.toString(),
    },
    { name: 'total', content: order.total.toString() },
  ]
  if (order.discountCode && order.discountTotal) {
    globalMergeVars.push(
      { name: 'discount_code', content: order.discountCode },
      { name: 'discount_total', content: order.discountTotal.toString() },
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
