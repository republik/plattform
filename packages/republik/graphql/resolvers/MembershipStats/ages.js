module.exports = (_, args, context) => {
  const { pgdb } = context

  /* Returns age distribution of active members */

  return pgdb.query(`
    SELECT
      extract(year from age(birthday)) AS age,
      count(distinct u.id) AS count
    FROM users u
    JOIN
      memberships m
      ON m."userId" = u.id
    WHERE m.active = true
    GROUP BY 1
    ORDER BY 1
`)
}
