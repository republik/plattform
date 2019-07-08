const count = async ({ pgdb }) => {
  const excludeParkingUserFragment = process.env.PARKING_USER_ID
    ? `u.id != '${process.env.PARKING_USER_ID}' AND`
    : ''

  return pgdb.queryOneField(`
    SELECT count(*)
    FROM users u
    WHERE
      ${excludeParkingUserFragment}
      u.roles @> '["member"]'
  `)
}

module.exports = { count }
