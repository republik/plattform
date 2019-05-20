const count = async ({ pgdb }) => {
  const { PARKING_USER_ID } = process.env

  return pgdb.queryOneField(`
    SELECT
      count(*)
    FROM
      users u
    WHERE
      u.roles @> '["member"]' AND
      u.id != :excludeUserId
  `, {
    excludeUserId: PARKING_USER_ID
  })
}

module.exports = { count }
