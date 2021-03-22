const Roles = require('../../../lib/Roles')
const transformUser = require('../../../lib/transformUser')

module.exports = async (_, { search, role, isListed }, { pgdb, user }) => {
  Roles.ensureUserHasRole(user, 'editor')

  const whereRoleClause = role ? `WHERE roles @> :role` : ''

  const whereIsListedClause = [true, false].includes(isListed)
    ? `WHERE "isListed" = :isListed`
    : ''

  const users = await pgdb.query(
    `
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
    ${whereRoleClause}
    ${whereIsListedClause}
    ORDER BY
      word_sim, dist
    LIMIT :limit
  `,
    {
      search: search.trim(),
      role: role ? JSON.stringify([role]) : null,
      isListed: [true, false].includes(isListed) ? isListed : null,
      limit: 30,
    },
  )

  return users.map(transformUser)
}
