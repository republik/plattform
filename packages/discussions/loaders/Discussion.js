const createDataLoader = require('@orbiting/backend-modules-dataloader')
const isUUID = require('is-uuid')
const { transformName } = require('../lib/nameClipper')

module.exports = (context) => ({
  clear: async (id) => {
    const discussion = id && isUUID.v4(id)
      ? await context.loaders.Discussion.byId.load(id)
      : await context.loaders.Discussion.byRepoId.load(id)
    if (discussion) {
      if (discussion.id) {
        context.loaders.Discussion.byId.clear(discussion.id)
      }
      if (discussion.repoId) {
        context.loaders.Discussion.byRepoId.clear(discussion.repoId)
      }
    }
    context.loaders.Discussion.byId.clear(id)
    context.loaders.Discussion.byRepoId.clear(id)
  },
  byId: createDataLoader(
    ids => context.pgdb.public.discussions.find({ id: ids })
  ),
  byRepoId: createDataLoader(
    repoIds => context.pgdb.public.discussions.find({ repoId: repoIds }),
    null,
    (key, rows) => rows.find(row => row.repoId === key)
  ),
  Commenter: {
    discussionPreferences: createDataLoader(keyObjs =>
      context.pgdb.public.discussionPreferences.find({
        or: keyObjs.map(keyObj => ({
          and: keyObj
        }))
      })
        .then(dps => dps
          .map(async (dp) => ({
            ...dp,
            credential: dp.credentialId && await context.loaders.User.credential.load(dp.credentialId)
          }))
        )
    )
  },
  byIdCommentsCount: createDataLoader(
    ids =>
      context.pgdb.query(`
        SELECT
          "discussionId",
          COUNT(*) AS count
        FROM
          comments
        WHERE
          ARRAY["discussionId"] && :ids
        GROUP BY
          "discussionId"
      `, {
        ids
      }),
    null,
    (key, rows) => {
      const row = rows.find(row => row.discussionId === key)
      return (row && row.count) || 0
    }
  ),
  byIdCommenterNamesToClip: createDataLoader(
    ids =>
      context.pgdb.query(`
        WITH names AS (
          SELECT
            DISTINCT c."discussionId", u."firstName", u."lastName"
          FROM
            comments c
          JOIN
            users u
            ON
              c."userId" = u.id
              AND u."hasPublicProfile" = false
          LEFT JOIN
            "discussionPreferences" dp
            ON
              c."userId" = dp."userId"
              AND c."discussionId" = dp."discussionId"
          JOIN
            discussions d
            ON c."discussionId" = d.id
          WHERE
            ARRAY[c."discussionId"] && :ids
            AND (dp."userId" IS NULL OR dp.anonymous = false)
            AND d.anonymity != 'ENFORCED'
            AND u."firstName" != 'Anonymous'
            AND u."lastName" != 'Anonymous'
        )
        SELECT
          "discussionId",
          json_agg(
            json_build_object(
              'firstName', trim("firstName"),
              'lastName', trim("lastName")
            )
          ) AS "userNames"
        FROM
          names
        GROUP BY
          "discussionId"
      `, {
        ids
      })
        .then(rows => rows
          .map(row => ({
            ...row,
            userNames: row.userNames.map(transformName)
          }))
        ),
    null,
    (key, rows) => {
      const row = rows.find(row => row.discussionId === key)
      return (row && row.userNames) || []
    }
  ),
  byIdCommenterIds: createDataLoader(
    ids =>
      context.pgdb.query(`
        WITH user_ids AS (
          SELECT
            DISTINCT c."discussionId", u.id as "userId"
          FROM
            comments c
          JOIN
            users u
            ON
              c."userId" = u.id
          LEFT JOIN
            "discussionPreferences" dp
            ON
              c."userId" = dp."userId"
              AND c."discussionId" = dp."discussionId"
          JOIN
            discussions d
            ON c."discussionId" = d.id
          WHERE
            ARRAY[c."discussionId"] && :ids
            AND (dp."userId" IS NULL OR dp.anonymous = false)
            AND d.anonymity != 'ENFORCED'
            AND u."firstName" != 'Anonymous'
            AND u."lastName" != 'Anonymous'
        )
        SELECT
          "discussionId",
          json_agg(
            "userId"
          ) AS "userIds"
        FROM
          user_ids
        GROUP BY
          "discussionId"
      `, {
        ids
      }),
    null,
    (key, rows) => {
      const row = rows.find(row => row.discussionId === key)
      return (row && row.userIds) || []
    }
  )
})
