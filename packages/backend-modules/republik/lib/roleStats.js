const { PARKING_USER_ID } = process.env

const count = async (role, { pgdb }) => {
  if (!role) {
    return
  }
  const result = await pgdb.queryOneField(
    `
    SELECT count(*)
    FROM users u
    WHERE
      ${PARKING_USER_ID ? 'u.id != :excludeUserId AND' : ''}
      u.roles @> :role
  `,
    {
      excludeUserId: PARKING_USER_ID,
      role: JSON.stringify([role]),
    },
  )
  return result
}

module.exports = { count }
