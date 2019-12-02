const { PARKING_USER_ID } = process.env

module.exports = (_, args, { pgdb }) =>
  pgdb.queryOneField(`
    SELECT
      count(DISTINCT m."userId")
    FROM
      memberships m
    WHERE
      ${PARKING_USER_ID ? 'm."userId" != :excludeUserId AND' : ''}
      m.active = true
  `, {
    excludeUserId: PARKING_USER_ID
  })
