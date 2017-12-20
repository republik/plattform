const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = {
  email (user, args, { pgdb, user: me }) {
    if (user._raw.isEmailPublic || Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return user._raw.email
    }
    return null
  },
  badges (user, args, { pgdb, user: me }) {
    if (Roles.userIsMeOrHasProfile(user, me)) {
      return user._raw.badges
    }
    return null
  },
  async latestComments (user, args, { pgdb, user: me }) {
    if (!Roles.userIsMeOrHasProfile(user, me)) {
      return null
    }
    const userId = user.id
    const limit = args.limit || 10

    const comments = await pgdb.query(
      `
      SELECT
        c.id,
        c."userId",
        c.content,
        c."adminUnpublished",
        c.published,
        c."createdAt",
        c."updatedAt",
        c."discussionId",
        d.title AS "discussionTitle"
      FROM comments c
      JOIN discussions d ON d.id = c."discussionId"
      WHERE
        c."userId" = :userId
      ORDER BY
        c."createdAt" DESC
      LIMIT :limit;
    `,
      { userId, limit }
    )

    if (comments.length) {
      return comments.map(comment => {
        return {
          ...comment,
          discussion: {
            id: comment.discussionId,
            title: comment.discussionTitle
          }
        }
      })
    }
  },
  async credentials (user, args, { pgdb, user: me }) {
    if (Roles.userIsMeOrHasProfile(user, me)) {
      return pgdb.public.credentials.find({
        userId: user.id
      })
    }
  },
  async address (user, args, {pgdb, user: me}) {
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      if (!user._raw.addressId) {
        return null
      }
      return pgdb.public.addresses.findOne({
        id: user._raw.addressId
      })
    }
    return null
  }
  // TODO: Implement memberships
  // TODO: Implement pledges
}
