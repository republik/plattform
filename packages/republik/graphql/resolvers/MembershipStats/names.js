module.exports = (_, args, context) => {
  const { pgdb } = context

  /* Returns distribution of first names and their gender of active members */

  return pgdb.query(`
    SELECT
      u."firstName" AS "firstName",
      g.gender AS gender,
      count(distinct u.id) AS count
    FROM users u
    JOIN
      memberships m
      ON m."userId" = u.id
    JOIN "statisticsNameGender" g
      ON u."firstName" = g."firstName"
    WHERE m.active = true
    GROUP BY 1, 2
    ORDER BY 3 DESC
  `)
}
