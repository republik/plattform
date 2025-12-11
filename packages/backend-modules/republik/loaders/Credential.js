const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = (context) => ({
  byUserId: createDataLoader(
    (userIds) =>
      context.pgdb.query(
        `
        SELECT
          c.*,
          COUNT(*) FILTER (WHERE dp.anonymous = TRUE) > 0 "usedAnonymous",
          COUNT(*) FILTER (WHERE dp.anonymous != TRUE) > 0 "usedNonAnonymous"
        FROM credentials c
        LEFT JOIN "discussionPreferences" dp
        ON c.id = dp."credentialId"
        WHERE
          c."userId" = ANY(:userIds)
        GROUP BY 1
    `,
        { userIds },
      ),
    null,
    (userId, credentials) =>
      credentials.filter((credential) => credential.userId === userId),
  ),
})
