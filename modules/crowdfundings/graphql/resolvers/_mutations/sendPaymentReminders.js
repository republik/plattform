const { Roles } = require('@orbiting/backend-modules-auth')
const logger = console
const { formatPrice } = require('@orbiting/backend-modules-formats')

module.exports = async (_, args, {pgdb, req, t, mail: {sendMailTemplate}}) => {
  Roles.ensureUserHasRole(req.user, 'supporter')

  const {
    paymentIds,
    emailSubject
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
          pay.hrid
        FROM
          payments pay
        JOIN
          "pledgePayments" pp
          ON pay.id=pp."paymentId"
        JOIN
          pledges p
          ON pp."pledgeId"=p.id
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
        templateName: 'cf_payment_reminder',
        globalMergeVars: [
          { name: 'TOTAL',
            content: formatPrice(payment.total)
          },
          { name: 'HRID',
            content: payment.hrid
          }
        ]
      })
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

    return payments.length
  } catch (e) {
    await transaction.transactionRollback()
    logger.error('error in transaction', { req: req._log(), args, error: e })
    throw e
  }
}
