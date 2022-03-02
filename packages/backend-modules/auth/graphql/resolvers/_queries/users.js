const Roles = require('../../../lib/Roles')
const transformUser = require('../../../lib/transformUser').default

module.exports = async (
  _,
  { search, role, isListed, hasPublicProfile },
  { pgdb, user },
) => {
  Roles.ensureUserHasRole(user, 'editor')

  const whereClauses = [
    role && 'roles @> :role',
    [true, false].includes(isListed) &&
      '"isListed" = :isListed AND "isAdminUnlisted" = FALSE',
    [true, false].includes(hasPublicProfile) &&
      '"hasPublicProfile" = :hasPublicProfile',
  ]
    .filter(Boolean)
    .join(' AND ')

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
    ${whereClauses && `WHERE ${whereClauses}`}
    ORDER BY
      word_sim, dist
    LIMIT :limit
  `,
    {
      search: search.trim(),
      role: role ? JSON.stringify([role]) : null,
      isListed: [true, false].includes(isListed) ? isListed : null,
      hasPublicProfile: [true, false].includes(hasPublicProfile)
        ? hasPublicProfile
        : null,
      limit: 30,
    },
  )

  return users.map(transformUser)
}
