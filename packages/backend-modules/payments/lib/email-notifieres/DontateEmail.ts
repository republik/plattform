import { PgDb } from 'pogi'
import { MailNotifier } from '../types'
import { sendMailTemplate } from '@orbiting/backend-modules-mail'
import { t } from '@orbiting/backend-modules-translate'

export type DonationNotifierArgs = {
  total_amount: number
}

export class DonateEmail implements MailNotifier<DonationNotifierArgs> {
  readonly templateName = 'payment_successful_donate'

  constructor(protected readonly pgdb: PgDb) {}

  async sendEmail(email: string, args: DonationNotifierArgs) {
    const globalMergeVars = [
      {
        name: 'total_formatted',
        content: (args.total_amount / 100).toFixed(2),
      },
    ]

    const sendMailResult = await sendMailTemplate(
      {
        to: email,
        fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS as string,
        subject: t(`api/email/${this.templateName}/subject`),
        templateName: this.templateName,
        mergeLanguage: 'handlebars',
        globalMergeVars,
      },
      { pgdb: this.pgdb },
    )

    return sendMailResult
  }
}
