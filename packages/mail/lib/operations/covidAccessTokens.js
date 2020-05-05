const Promise = require('bluebird')
const crypto = require('crypto')

const { transformUser, AccessToken } = require('@orbiting/backend-modules-auth')
const { encode } = require('@orbiting/backend-modules-base64u')

const md5 = data => crypto.createHash('md5').update(data).digest('hex')

module.exports = async ({ pgdb }) => {
  const consents = await pgdb.query(`
    SELECT c."userId", c.record
    FROM "consents" c
    JOIN "users" u ON u.id = c."userId"
      AND u.verified = TRUE
      AND u."deletedAt" IS NULL
    WHERE c.policy = 'NEWSLETTER_COVID19'
    ORDER BY c."createdAt"
  `)

  const userIds = new Set()

  consents.map(consent => {
    if (consent.record === 'GRANT') {
      userIds.add(consent.userId)
    } else if (consent.record === 'REVOKE') {
      userIds.delete(consent.userId)
    }
  })

  const users = await pgdb.public.users.find({ id: Array.from(userIds) })
    .then(u => u.map(transformUser))

  const operations = await Promise.map(users, user => ({
    subscriberHash: md5(user.email.toLowerCase()),
    method: 'PATCH',
    body: {
      merge_fields: {
        EMAILB64U: encode(user.email),
        AS_ATOKEN: AccessToken.generateForUser(user, 'AUTHORIZE_SESSION')
      }
    }
  }))

  return operations
}
