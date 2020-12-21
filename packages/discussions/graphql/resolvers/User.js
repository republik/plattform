const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = {
  async comments(user, args, { pgdb, user: me }) {
    const emptyCommentConnection = {
      id: user.id,
      totalCount: 0,
      pageInfo: null,
      nodes: [],
    }
    if (!Roles.userIsMeOrProfileVisible(user, me)) {
      return emptyCommentConnection
    }
    const { first: _first = 10, after } = args
    const first = Math.min(_first, 100)

    const comments = await pgdb.query(
      `
      SELECT
        c.*,
        to_json(d.*) AS discussion
      FROM
        comments c
      JOIN
        discussions d
        ON d.id = c."discussionId"
      LEFT JOIN
        "discussionPreferences" dp
        ON
          dp."discussionId" = d.id AND
          dp."userId" = :userId
      WHERE
        c."userId" = :userId AND
        d.anonymity != 'ENFORCED' AND
        d.hidden = false AND
        (dp IS NULL OR dp.anonymous = false)
      ORDER BY
        c."createdAt" DESC
    `,
      {
        userId: user.id,
      },
    )
    const totalCount = comments.length

    if (!me || !Roles.userIsInRoles(me, ['member']) || !comments.length) {
      return {
        ...emptyCommentConnection,
        totalCount,
      }
    }

    const afterId = after
      ? Buffer.from(after, 'base64').toString('utf-8')
      : null

    let startIndex = 0
    if (afterId) {
      startIndex = comments.findIndex((node) => node.id === afterId)
    }
    const endIndex = startIndex + first
    const nodes = comments.slice(startIndex, endIndex)

    return {
      id: user.id,
      totalCount,
      pageInfo: {
        endCursor: nodes.length
          ? Buffer.from(`${nodes[nodes.length - 1].id}`).toString('base64')
          : null,
        hasNextPage: endIndex < comments.length,
      },
      nodes,
    }
  },

  isSuspended: async (user, args, { loaders, user: me }) => {
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return !!(await loaders.DiscussionSuspension.byUserId.load(user.id))
        .length
    }

    return null
  },
  suspendedUntil: async (user, args, { loaders, user: me }) => {
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      const suspensions = await loaders.DiscussionSuspension.byUserId.load(
        user.id,
      )

      if (suspensions.length) {
        const until = Math.max(...suspensions.map((s) => s.endAt))
        return new Date(until)
      }
    }

    return null
  },
  suspensions: async (user, args, { pgdb, loaders, user: me }) => {
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      if (args.withInactive) {
        return loaders.DiscussionSuspension.byUserIdWithInactive.load(user.id)
      }

      return loaders.DiscussionSuspension.byUserId.load(user.id)
    }

    return null
  },
}
