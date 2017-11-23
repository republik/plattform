const Roles = require('../../../lib/Roles')

module.exports = async (
  _,
  { search, role },
  { pgdb, user }
) => {
  Roles.ensureUserHasRole(user, 'editor')

  return await pgdb.query(`
    SELECT
      u.*,
      concat_ws(' ',
        u."firstName"::text,
        u."lastName"::text,
        u.email::text
      ) <->> :search AS word_sim,
      concat_ws(' ',
        u."firstName"::text,
        u."lastName"::text,
        u.email::text
      ) <-> :search AS dist
    FROM
      users u
    WHERE
      roles @> :role
    ORDER BY
      word_sim, dist
    LIMIT :limit
  `, {
    search: search.trim(),
    role: JSON.stringify([role]),
    limit: 30
  })
}

