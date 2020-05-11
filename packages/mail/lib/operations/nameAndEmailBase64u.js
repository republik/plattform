const Promise = require('bluebird')

const { encode } = require('@orbiting/backend-modules-base64u')

module.exports = async ({ pgdb }) => {
  const users = await pgdb.query(`
    SELECT u."firstName", u."lastName", u.email, md5(lower(u.email)) "__subscriberHash"
    FROM "users" u
    WHERE u.verified = TRUE AND u."deletedAt" IS NULL
    ORDER BY RANDOM()
  `)

  const operations = await Promise.map(users, user => ({
    subscriberHash: user.__subscriberHash,
    method: 'PATCH',
    body: {
      merge_fields: {
        FNAME: user.firstName || '',
        LNAME: user.lastName || '',
        EMAILB64U: encode(user.email)
      }
    }
  }))

  return operations
}
