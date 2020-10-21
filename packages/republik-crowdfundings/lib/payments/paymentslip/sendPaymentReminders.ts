import moment from 'moment'
import { PgDb } from 'pogi'
import { Nominal } from 'simplytyped'
import { getAmountOfUnmatchedPayments } from './helpers'
import { formatPrice } from '@orbiting/backend-modules-formats'
import { Context } from '@orbiting/backend-modules-types'
import { publishFinance } from '@orbiting/backend-modules-republik/lib/slack'

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { PAYMENT_DEADLINE_DAYS } = require('./helpers')

const DRY_RUN = process.env.DRY_RUN_SEND_PAYMENT_REMINDERS === 'true'

const FIRST_REMINDER_DEADLINE_DAYS = PAYMENT_DEADLINE_DAYS + 3 // 3 days to consider weekends
const SECOND_REMINDER_DEADLINE_DAYS = FIRST_REMINDER_DEADLINE_DAYS + 30
const CANCEL_PLEDGE_DEADLINE_DAYS = SECOND_REMINDER_DEADLINE_DAYS + 15
const DAYS_TO_CONSIDER = CANCEL_PLEDGE_DEADLINE_DAYS + 30

interface OutstandingPayment {
  paymentId: Nominal<string, 'paymentId'>
  userId: Nominal<string, 'userId'>
  pledgeId: Nominal<string, 'pledgeId'>
  createdAt: Date
  hrid: string
  remindersSentAt: Readonly<null | [] | [Date] | [Date, Date]>
  total: number
  email: Nominal<string, 'userEmail'>
  companyName: string
}

export async function sendPaymentReminders(
  context: Context,
  { dryRun = DRY_RUN } = {},
): Promise<void> {
  const { pgdb } = context
  if (await hasUnmatchedPayments(pgdb)) {
    return
  }

  const outstandingPayments = await getOutstandingPayments(pgdb)

  const [
    firstRemindersSent,
    secondRemindersSent,
    cancelMessages,
  ] = await Promise.all([
    sendFirstReminder(outstandingPayments, context, dryRun),
    sendSecondReminder(outstandingPayments, context, dryRun),
    getMessageForAccountsToCancel(outstandingPayments),
  ])

  let messageLines = [
    ...(dryRun ? ['⚠️ DRY RUN, REMINDERS ARE NOT SENT ⚠️'] : []),
    '💌 Reminders Sent',
    '',
    `First reminders sent: ${firstRemindersSent}`,
    `SecondRemindersSent: ${secondRemindersSent}`,
  ]

  if (cancelMessages.length) {
    messageLines = [
      ...messageLines,
      '',
      '🚨 Action Required - Cancel Pledges 🚨',
      ...cancelMessages,
    ]
  }

  await publishFinance(messageLines.join('\n'))
}

function getMessageForAccountsToCancel(
  outstandingPayments: OutstandingPayment[],
) {
  const filterDate = daysAgo(CANCEL_PLEDGE_DEADLINE_DAYS)
  return outstandingPayments
    .filter(({ createdAt }) => createdAt < filterDate)
    .map(paymentToMessage)
}

function paymentToMessage({ userId, pledgeId }: OutstandingPayment) {
  return [
    '',
    `User: {ADMIN_FRONTEND_BASE_URL}/users/${userId}`,
    `Pledge ID: ${pledgeId}`,
  ].join('\n')
}

function sendFirstReminder(
  outstandingPayments: OutstandingPayment[],
  context: Context,
  dryRun: boolean,
) {
  const filterDate = daysAgo(FIRST_REMINDER_DEADLINE_DAYS)
  const filter = ({ createdAt, remindersSentAt }: OutstandingPayment) => {
    if (remindersSentAt !== null && remindersSentAt.length) {
      return false
    }

    return createdAt < filterDate
  }

  return sendReminders({
    outstandingPayments,
    filter,
    context,
    isLast: false,
    dryRun,
  })
}

function sendSecondReminder(
  outstandingPayments: OutstandingPayment[],
  context: Context,
  dryRun: boolean,
) {
  const filterDate = daysAgo(SECOND_REMINDER_DEADLINE_DAYS)

  const filter = ({ createdAt, remindersSentAt }: OutstandingPayment) => {
    if (remindersSentAt?.length !== 1) {
      return false
    }

    return createdAt < filterDate
  }

  return sendReminders({
    outstandingPayments,
    filter,
    context,
    isLast: true,
    dryRun,
  })
}

function daysAgo(n: number) {
  return moment().subtract(n, 'days').toDate()
}
interface sendRemindersParameters {
  outstandingPayments: OutstandingPayment[]
  filter: ({ createdAt, remindersSentAt }: OutstandingPayment) => boolean
  context: Context
  isLast: boolean
  dryRun: boolean
}
async function sendReminders({
  outstandingPayments,
  filter,
  context,
  isLast,
  dryRun,
}: sendRemindersParameters) {
  const latePayments = outstandingPayments.filter(filter)

  if (dryRun) {
    await dryRunInform(latePayments, isLast)
    return latePayments.length
  }

  for (const payment of latePayments) {
    await send({
      payment,
      context,
      isLast,
    })
    await updatePayment({ payment, pgdb: context.pgdb })
  }
  return latePayments.length
}

async function dryRunInform(payments: OutstandingPayment[], isLast: boolean) {
  const message = [
    '⚠️ DRY RUN, REMINDERS ARE NOT SENT ⚠️',
    `${isLast ? 'Second' : 'First'} reminder would be sent to:`,
    ...payments.map(paymentToMessage),
  ].join('\n')
  await publishFinance(message)
}

async function updatePayment({
  payment,
  pgdb,
}: {
  payment: OutstandingPayment
  pgdb: PgDb
}) {
  const remindersSentAt = [...(payment.remindersSentAt || []), new Date()]

  await pgdb.public.payments.updateOne(
    {
      id: payment.paymentId,
    },
    {
      remindersSentAt,
    },
  )
}

interface SendParameters {
  payment: OutstandingPayment
  context: Context
  isLast: boolean
}
async function send({
  payment,
  isLast,
  context,
}: SendParameters): Promise<void> {
  const emailSubject = isLast
    ? 'LETZTE MAHNUNG Republik-Abonnement/Mitgliedschaft/Spende'
    : 'Zahlungserinnerung Republik-Abonnement/Mitgliedschaft/Spende'

  await sendMailTemplate(
    {
      to: payment.email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
      subject: emailSubject, // todo: move strings to `t`
      templateName: isLast ? 'cf_payment_reminder_last' : 'cf_payment_reminder',
      globalMergeVars: [
        { name: 'TOTAL', content: formatPrice(payment.total) },
        { name: 'HRID', content: payment.hrid },
        { name: 'COMPANY_NAME', content: payment.companyName },
      ],
    },
    context,
  )
}

async function getOutstandingPayments(
  pgdb: PgDb,
): Promise<OutstandingPayment[]> {
  return await pgdb.query(outstandingPaymentsQuery, {
    date: moment().subtract(DAYS_TO_CONSIDER, 'days'),
  })
}

async function hasUnmatchedPayments(pgdb: PgDb) {
  return !!(await getAmountOfUnmatchedPayments(pgdb))
}

const outstandingPaymentsQuery = `
SELECT
  payments.id AS "paymentId",
  payments."createdAt",
  payments."remindersSentAt",
  payments.hrid,
  payments.total,
  pledges.id AS "pledgeId",
  users.email,
  users.id AS "userId",
  companies.name AS "companyName"

FROM payments

INNER JOIN "pledgePayments"
  ON "pledgePayments"."paymentId" = payments.id

 INNER JOIN pledges
   ON pledges.id = "pledgePayments"."pledgeId"

INNER JOIN packages
  ON packages.id = pledges."packageId"

INNER JOIN users
  ON pledges."userId" = users.id

INNER JOIN companies
  ON packages."companyId" = companies.id

WHERE payments."dueDate" < now()
AND payments.status = 'WAITING'
AND payments.method = 'PAYMENTSLIP'
AND pledges.status = 'SUCCESSFUL'
AND payments."createdAt" > :date
;
`
