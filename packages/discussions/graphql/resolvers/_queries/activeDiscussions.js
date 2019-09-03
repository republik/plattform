const moment = require('moment')

module.exports = async (_, { lastDays = 5, first = 10 }, { pgdb }) =>
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
      d.closed = false
    GROUP BY d.id
    ORDER BY 1 DESC
    LIMIT :first
  `, {
    minDate: moment().subtract(lastDays, 'days'),
    first
  })
    .then(result => result
      .map(result => ({
        count: result.count,
        discussion: result
      }))
    )
