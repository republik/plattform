const { PARKING_USER_ID } = process.env

const count = async ({ pgdb }) =>
  pgdb.queryOneField(`
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

module.exports = {
  count
}
