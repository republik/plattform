import { sendMailTemplate } from '@orbiting/backend-modules-mail'
import { t } from '@orbiting/backend-modules-translate'

import { PgDb } from 'pogi'
import { Subscription } from '../types'

type MergeVariable = {name: string, content: string}

export async function sendSetupSubscriptionMail(subscription: Subscription, email: string, pgdb: PgDb) {

  console.log('... sending transactional mail')
  
  const globalMergeVars: MergeVariable[] = [{ name: 'var_name', content: 'var_content' }]
  const templateName = 'subscription_created_' + subscription.type.toLowerCase()
  const sendMailResult = await sendMailTemplate(
    {
      to: email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
      subject: t(`api/email/${templateName}/subject`),
      templateName,
      mergeLanguage: 'handlebars',
      globalMergeVars,
    },
    { pgdb },
  )

  return sendMailResult
}
