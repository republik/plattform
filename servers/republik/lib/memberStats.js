const { PARKING_USER_ID } = process.env

const count = ({ pgdb }) =>
  pgdb.queryOneField(`
    SELECT count(*)
    FROM users u
    WHERE
      ${PARKING_USER_ID ? 'u.id != :excludeUserId AND' : ''}
      u.roles @> '["member"]'
  `, {
    excludeUserId: PARKING_USER_ID
  })

module.exports = { count }
