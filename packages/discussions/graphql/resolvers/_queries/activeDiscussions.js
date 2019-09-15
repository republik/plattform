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
      AND d.hidden = false
      AND d.closed = false
    WHERE
      c."createdAt" > :minDate
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
