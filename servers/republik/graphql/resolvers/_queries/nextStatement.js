const {
  transformUser
} = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, {pgdb, t}) => {
  const { sequenceNumber, orderDirection } = args
  const isAsc = orderDirection === 'ASC'
  return pgdb.query(`
    SELECT
      u.*,
      m."sequenceNumber" as "sequenceNumber"
    FROM users u
    JOIN memberships m
      ON m.id = (
        SELECT id
        FROM memberships
        WHERE "userId" = u.id
        ORDER BY "sequenceNumber" ASC
        LIMIT 1
      )
    WHERE
      m."sequenceNumber" ${isAsc ? '>' : '<'} :sequenceNumber AND
      u."isListed" = true AND u."isAdminUnlisted" = false AND
      u."portraitUrl" is not null
    ORDER BY m."sequenceNumber" ${isAsc ? 'ASC' : 'DESC'}
    LIMIT 1
  `, {
    sequenceNumber: sequenceNumber
  })
    .then(result => transformUser(result[0]))
}
