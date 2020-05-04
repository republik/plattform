const Promise = require('bluebird')

const { transformUser, AccessToken } = require('@orbiting/backend-modules-auth')
const { encode } = require('@orbiting/backend-modules-base64u')

module.exports = async ({ pgdb }) => {
  const users = await pgdb.query(`
    WITH "grantsAndRevokes" AS (
      SELECT c."userId"
      FROM "consents" c
      WHERE c.policy = 'NEWSLETTER_COVID19'
    )
    
    SELECT u.*, md5(lower(u.email)) "__subscriberHash", COUNT(*) % 2 > 0 "__subscribed"
    FROM "grantsAndRevokes" gr
    JOIN "users" u ON u.id = gr."userId"
    WHERE u.verified = TRUE
    GROUP BY u.id
    ORDER BY RANDOM()
  `)
    .then(users => users.filter(u => !!u.__subscribed).map(transformUser))

  const operations = await Promise.map(users, user => ({
    subscriberHash: user._raw.__subscriberHash,
    method: 'PATCH',
    body: {
      merge_fields: {
        EMAILB64U: encode(user.email),
        AS_ATOKEN: AccessToken.generateForUser(user, 'AUTHORIZE_SESSION')
      }
    }
  }), { concurrency: 1 })

  console.log(users.length, operations.length)

  return operations
}
