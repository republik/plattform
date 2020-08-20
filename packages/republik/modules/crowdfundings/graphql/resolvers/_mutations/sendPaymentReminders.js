const { Roles } = require('@orbiting/backend-modules-auth')
const logger = console
const { formatPrice } = require('@orbiting/backend-modules-formats')
const { publishMonitor } = require('../../../../../lib/slack')
const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

module.exports = async (_, args, context) => {
  const { pgdb, req, t } = context
  Roles.ensureUserHasRole(req.user, 'supporter')

  const {
    paymentIds,
    emailSubject,
    isLast
  } = args
  if (!paymentIds.length) {
    return 0
  }

  const now = new Date()
  const transaction = await pgdb.transactionBegin()
  try {
    const payments = await transaction.query(`
        SELECT
          u.email,
          pay.total,
          pay.hrid,
          c.name AS "companyName"
        FROM
          payments pay
        JOIN
          "pledgePayments" pp
          ON pay.id=pp."paymentId"
        JOIN
          pledges p
          ON pp."pledgeId"=p.id
        JOIN
          packages pkgs
          ON p."packageId"=pkgs.id
        JOIN
          companies c
          ON pkgs."companyId"=c.id
        JOIN
          users u
          ON p."userId"=u.id
        WHERE
          pay.status = 'WAITING' AND
          pay.method = 'PAYMENTSLIP' AND
          pay."dueDate" < :now AND
          ARRAY[pay.id] && :paymentIds
      `, {
      now,
      paymentIds
    })

    for (let payment of payments) {
      await sendMailTemplate({
        to: payment.email,
        fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
        subject: emailSubject || t('api/email/payment/reminder/subject'),
        templateName: isLast
          ? 'cf_payment_reminder_last'
          : 'cf_payment_reminder',
        globalMergeVars: [
          { name: 'TOTAL',
            content: formatPrice(payment.total)
          },
          { name: 'HRID',
            content: payment.hrid
          },
          { name: 'COMPANY_NAME',
            content: payment.companyName
          }
        ]
      }, context)
    }

    await transaction.query(`
      UPDATE
        payments pay
      SET
        "remindersSentAt" = COALESCE("remindersSentAt", '[]'::jsonb)::jsonb || :now::jsonb
      WHERE
        ARRAY[pay.id] && :paymentIds
    `, {
      now: JSON.stringify([now]),
      paymentIds
    })

    await transaction.transactionCommit()

    await publishMonitor(
      req.user,
      `sendPaymentReminders paymentIds: ${paymentIds.join(',')}`
    )

    return payments.length
  } catch (e) {
    await transaction.transactionRollback()
    logger.error('error in transaction', { req: req._log(), args, error: e })
    throw e
  }
}
