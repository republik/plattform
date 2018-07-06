module.exports = async (_, args, { pgdb, req }) => {
  const { email } = args

  const userWithDevices = await pgdb.query(`
    SELECT
      u.*,
      jsonb_agg(d.*) as devices
    FROM
      users u
    JOIN
      devices d
      ON u.id = d."userId"
    WHERE
      u.email = :email
    GROUP BY
      u.id
  `, {
    email
  })
    .then(result => result[0])

  if (userWithDevices && userWithDevices.devices.length > 0) {
    return ['EMAIL_TOKEN', 'APP']
  }

  return ['EMAIL_TOKEN']
}
