const moment = require('moment')

module.exports = async (_, { lastDays = 5 }, { pgdb }) =>
  pgdb.query(`
    SELECT
      COUNT(*) as count,
      d.*
    FROM comments c
    JOIN
      discussions d
      ON c."discussionId" = d.id
    WHERE
      c."createdAt" > :minDate AND
      d.closed = false AND
      d.hidden = false
    GROUP BY d.id
    ORDER BY 1 DESC
  `, {
    minDate: moment().subtract(lastDays, 'days')
  })
    .then(result => result
      .map(result => ({
        count: result.count,
        discussion: result
      }))
    )
