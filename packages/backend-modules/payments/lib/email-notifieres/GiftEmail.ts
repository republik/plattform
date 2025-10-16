import { PgDb } from 'pogi'
import { MergeVariable } from '../transactionals/sendTransactionalMails'
import { MailNotifier } from '../types'
import { sendMailTemplate } from '@orbiting/backend-modules-mail'
import { t } from '@orbiting/backend-modules-translate'

export class GiftCodeEmail implements MailNotifier<{ code: string }> {
  private readonly templateName = 'payment_successful_gift_voucher'

  constructor(protected readonly pgdb: PgDb) {}

  async sendEmail(email: string, args: { code: string }) {
    const globalMergeVars: MergeVariable[] = [
      {
        name: 'voucher_codes',
        content: args.code.replace(/(\w{4})(\w{4})/, '$1-$2'),
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
