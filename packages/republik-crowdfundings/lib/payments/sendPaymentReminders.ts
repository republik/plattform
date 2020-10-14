import { PgDb } from 'pogi'
import { getAmountOfUnmatchedPayments } from './helpers'
const {
  publishFinance,
}: {
  publishFinance: (message: string) => Promise<void>
} = require('@orbiting/backend-modules-republik/lib/slack')

interface sendPaymentRemindersArguments {
  transaction: PgDb
}
export async function sendPaymentReminders({
  transaction,
}: sendPaymentRemindersArguments): Promise<void> {
  const amountOfUnmatchedPayments = await getAmountOfUnmatchedPayments(
    transaction,
  )

  if (amountOfUnmatchedPayments > 0) {
    informAboutUnmatchedPayments(amountOfUnmatchedPayments)
    return
  }
}

function informAboutUnmatchedPayments(amountOfUnmatchedPayments: number) {
  const payments = amountOfUnmatchedPayments === 1 ? 'payment' : 'payments'

  publishFinance(
    [
      `‼️ Could not send payment reminders.`,
      `💸 ${amountOfUnmatchedPayments} ${payments} need to be matched.`,
    ].join('\n'),
  )
}
