import moment from 'moment'
import { PgDb } from 'pogi'
import { Nominal } from 'simplytyped'
import {
  getAmountOfUnmatchedPayments,
  getLatestImportSecondsAgo,
} from './helpers'
import { formatPrice } from '@orbiting/backend-modules-formats'
import { Context } from '@orbiting/backend-modules-types'
import { publishFinance } from '@orbiting/backend-modules-republik/lib/slack'
import * as invoices from '@orbiting/backend-modules-invoices'

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { PAYMENT_DEADLINE_DAYS } = require('./helpers')

if (typeof PAYMENT_DEADLINE_DAYS !== 'number') {
  throw new Error('PAYMENT_DEADLINE_DAYS should be a number.')
}

const DRY_RUN = process.env.DRY_RUN_SEND_PAYMENT_REMINDERS === 'true'

const FIRST_REMINDER_DEADLINE_DAYS = PAYMENT_DEADLINE_DAYS + 3 // 3 days to consider weekends
const SECOND_REMINDER_DEADLINE_DAYS = FIRST_REMINDER_DEADLINE_DAYS + 14
const DAYS_TO_CONSIDER = SECOND_REMINDER_DEADLINE_DAYS + 30 + 16 + 14 // add 16 days due to shortening of second reminder delay, can be shortened later, add 14 days because some reminders were not sent 
const MAX_SECONDS_RECENT_IMPORT = 60 * 60 * 12 // 12 hours

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
  packageName: string
}

export async function sendPaymentReminders(
  context: Context,
  { dryRun = DRY_RUN } = {},
): Promise<string> {
  const { pgdb } = context
  if (await hasUnmatchedPayments(pgdb)) {
    return 'Could not send payment reminders, there are still umatched payments.'
  }

  if (await hasNoRecentImport(pgdb)) {
    return 'Could not send payment reminders, there is not recent import.'
  }

  const outstandingPayments = await getOutstandingPayments(pgdb)

  const [firstRemindersSent, secondRemindersSent] = await Promise.all([
    sendFirstReminder(outstandingPayments, context, dryRun),
    sendSecondReminder(outstandingPayments, context, dryRun),
  ])

  const message = generateReport({
    dryRun,
    firstRemindersSent,
    secondRemindersSent,
  })

  await publishFinance(message)
  return message
}

function generateReport({
  dryRun,
  firstRemindersSent,
  secondRemindersSent,
}: {
  dryRun: boolean
  firstRemindersSent: number
  secondRemindersSent: number
}) {
  return [
    ...(dryRun ? ['⚠️ DRY RUN, REMINDERS ARE NOT SENT ⚠️'] : []),
    '💌 Reminders Sent',
    '',
    `First reminders sent: ${firstRemindersSent}`,
    `SecondRemindersSent: ${secondRemindersSent}`,
  ].join('\n')
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

  const daysBetweenReminders =
    SECOND_REMINDER_DEADLINE_DAYS - FIRST_REMINDER_DEADLINE_DAYS

  const filter = ({ createdAt, remindersSentAt }: OutstandingPayment) => {
    if (remindersSentAt?.length !== 1) {
      return false
    }

    const daysSinceFirstReminder = moment().diff(remindersSentAt[0], 'days')

    if (daysSinceFirstReminder < daysBetweenReminders) {
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
  const resolvedPayment = await invoices.commons.resolvePayment(
    { hrid: payment.hrid },
    context,
  )

  const creditor = resolvedPayment.pledge?.package?.bankAccount

  // api/email/payment/reminder/isLast:${isLast}/packageName:${packageName}/subject
  const subject = context.t([
    [
      'api',
      'email',
      'payment',
      'reminder',
      `isLast:${isLast ? true : false}`,
      `packageName:${payment.packageName}`,
      'subject',
    ].join('/'),
  ])

  // payment_rminder_[last_][$package.packageName.toLowerCase()]
  const templateName = [
    'payment',
    'reminder',
    isLast && 'last',
    payment.packageName.toLowerCase(),
  ]
    .filter(Boolean)
    .join('_')

  await sendMailTemplate(
    {
      to: payment.email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
      subject,
      templateName,
      globalMergeVars: [
        {
          name: 'total',
          content: formatPrice(resolvedPayment.total),
        },
        {
          name: 'iban',
          content: creditor?.iban?.match(/.{1,4}/g)?.join(' '),
        },
        {
          name: 'reference',
          content: invoices.commons.getReference(resolvedPayment.hrid, true),
        },
      ],
      attachments: [
        {
          type: 'application/pdf',
          name:
            [
              'QR-Rechnung',
              creditor?.address?.name,
              invoices.commons.getReference(resolvedPayment.hrid, true),
            ]
              .filter(Boolean)
              .join(' ') + '.pdf',
          content: (
            await invoices.paymentslip.generate(resolvedPayment)
          ).toString('base64'),
        },
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

async function hasNoRecentImport(pgdb: PgDb) {
  const secondsAgo = await getLatestImportSecondsAgo(pgdb)
  return secondsAgo > MAX_SECONDS_RECENT_IMPORT
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
  companies.name AS "companyName",
  packages.name as "packageName"

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
AND pledges.status IN ('SUCCESSFUL', 'WAITING_FOR_PAYMENT')
AND payments."createdAt" > :date
;
`
