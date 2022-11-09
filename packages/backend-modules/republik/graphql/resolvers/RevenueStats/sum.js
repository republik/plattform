const moment = require('moment')

const query = `
SELECT
  SUM(pay.total) "total"
FROM
  payments pay
JOIN "pledgePayments" pp ON pp."paymentId" = pay.id
JOIN "pledges" p ON p.id = pp."pledgeId"
WHERE
  pay.status IN ('PAID', 'WAITING') AND
  p.status != 'WAITING_FOR_PAYMENT' AND
  pay."createdAt" > :min AND
  pay."createdAt" <= :max
`

module.exports = async (_, args, context) => {
  const { pgdb } = context

  const min = moment(args.min)
  const max = moment(args.max)

  const total = await pgdb.queryOneField(query, {
    min,
    max,
  })

  return {
    total,
    updatedAt: new Date(),
  }
}
