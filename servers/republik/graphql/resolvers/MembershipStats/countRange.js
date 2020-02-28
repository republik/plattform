const moment = require('moment')

module.exports = (_, args, context) => {
  const { pgdb } = context

  const min = moment(args.min)
  const max = moment(args.max)

  return pgdb.queryOneField(`
    SELECT
      count(*)
    FROM
      memberships m
    WHERE
      m."createdAt" BETWEEN :min AND :max
  `, {
    min,
    max
  })
}
