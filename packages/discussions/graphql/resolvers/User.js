const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = {
  async comments (user, args, { pgdb, user: me }) {
    const emptyCommentConnection = {
      id: user.id,
      totalCount: 0,
      pageInfo: null,
      nodes: []
    }
    if (!Roles.userIsMeOrProfileVisible(user, me)) {
      return emptyCommentConnection
    }
    const {
      first: _first = 10,
      after
    } = args
    const first = Math.min(_first, 100)

    const comments = await pgdb.query(`
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
    `, {
      userId: user.id
    })
    const totalCount = comments.length

    if (!me || !Roles.userIsInRoles(me, ['member']) || !comments.length) {
      return {
        ...emptyCommentConnection,
        totalCount
      }
    }

    const afterId = after
      ? Buffer.from(after, 'base64').toString('utf-8')
      : null

    let startIndex = 0
    if (afterId) {
      startIndex = comments.findIndex(node => node.id === afterId)
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
        hasNextPage: endIndex < comments.length
      },
      nodes
    }
  }
}
