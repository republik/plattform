const { Roles } = require('@orbiting/backend-modules-auth')
const { transformUser } = require('@orbiting/backend-modules-auth')

// Lower threshold requires word(s) to be more similar
const WORD_SIMILARITY_THRESHOLD = 0.6

// List of patters a search is matched against (test)
const patterns = [
  {
    name: 'email address',
    test: /(?<word>\S*@\S+)/i,
    query: `
      SELECT
        u.email <->> :word AS word_sim,
        u.id "userId"
      FROM users u
    `,
    threshold: 0.3
  },
  {
    name: 'address',
    test: /^adr:(?<word>.+)/i,
    query: `
      SELECT
        replace(
          concat_ws(
            ' ',
            CASE WHEN concat_ws(' ', u."firstName", u."lastName") = a.name 
              THEN a.name
              ELSE concat_ws(' ', u."firstName", u."lastName", a.name)
            END,
            a.line1, a.line2, a."postalCode", a.city, a.country),
          '  ',
          ' '
        ) <->> :word AS word_sim,
        u.id "userId"
      FROM "users" u
      JOIN "addresses" a ON u."addressId" = a.id
    `
  },
  {
    name: 'payment HR-ID',
    test: /^hrid:(?<word>\S+)/i,
    query: `
      SELECT
        pay."hrid" <->> :word AS word_sim,
        p."userId"
      FROM "payments" pay
      JOIN "pledgePayments" pp ON pay.id = pp."paymentId"
      JOIN "pledges" p ON pp."pledgeId" = p.id
    `
  },
  {
    name: 'membership voucher code',
    test: /^code:(?<word>\S+)/i,
    query: `
      SELECT
        m."voucherCode" <->> :word AS word_sim,
        m."userId"
      FROM "memberships" m
      WHERE m."voucherCode" IS NOT NULL
    `
  },
  {
    name: 'membership sequence number',
    test: /^abo:(?<word>\d+)/i,
    query: `
      SELECT
        m."sequenceNumber"::text <->> :word AS word_sim,
        m."userId"
      FROM "memberships" m
    `,
    threshold: 0.2
  },
  {
    name: 'access grant code',
    test: /^probe:(?<word>\S+)/i,
    query: `
      SELECT
        ag."voucherCode" <->> :word AS word_sim,
        coalesce(ag."recipientUserId", ag."granterUserId") "userId"
      FROM "accessGrants" ag
      WHERE ag."voucherCode" IS NOT NULL
    `
  },
  {
    name: 'user full name',
    test: /(?<word>.+)/i,
    query: `
        SELECT
        concat_ws(' ', u."firstName", u."lastName") <->> :word AS word_sim,
        u.id "userId"
      FROM users u
      WHERE u."firstName" IS NOT NULL
        OR u."lastName" IS NOT NULL
    `
  }
]

module.exports = async (_, { limit, offset = 0, search }, { pgdb, user }) => {
  Roles.ensureUserHasRole(user, 'supporter')

  const pattern = search && patterns.reduce(
    (chosen, pattern) => {
      // Skip if a pattern matched already
      if (chosen) {
        return chosen
      }

      const match = search.match(pattern.test)
      if (match) {
        return {
          ...pattern,
          match
        }
      }
    },
    null
  )

  if (pattern) {
    const { query, threshold, match: { groups: { word } } } = pattern

    const users = await pgdb.query(
      `
        WITH "groupedByUser" AS (
          WITH query AS (
            ${query}
          )
          
          SELECT MIN(word_sim) word_sim, "userId"
          FROM query
          GROUP BY "userId"
        )
        
        SELECT g.word_sim, u.*
        FROM "groupedByUser" g
        JOIN users u ON g."userId" = u.id AND u."deletedAt" IS NULL
        WHERE g.word_sim < :threshold
        ORDER BY g.word_sim, u."createdAt" ASC
      `,
      {
        word,
        threshold: threshold || WORD_SIMILARITY_THRESHOLD
      }
    )

    return {
      items: users.slice(offset, offset + limit).map(transformUser),
      count: users.length
    }
  }

  return {
    items: (await pgdb.public.users.find(
      { deletedAt: null },
      { orderBy: { createdAt: 'DESC' }, limit, offset })
    ).map(transformUser),
    count: await pgdb.public.users.count()
  }
}
