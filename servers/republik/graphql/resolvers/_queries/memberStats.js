const { PARKING_USER_ID } = process.env

module.exports = (_, args, { pgdb, user: me }) => ({
  count: async () => {
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
})
