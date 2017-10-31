module.exports = {
  async testimonial (user, args, { pgdb }) {
    const testimonial = await pgdb.public.testimonials.findOne({
      userId: user.id
    })
    if (testimonial) {
      return {
        ...testimonial,
        name: user.name
      }
    }
  },
  async latestComments (user, args, { pgdb }) {
    const userId = user.id
    const limit = 10

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
        d.title AS "discussionTitle"
      FROM comments c
      JOIN discussions d ON d.id = c."discussionId"
      WHERE
        c."userId" = :userId
      LIMIT :limit;
    `,
      { userId, limit }
    )

    if (comments.length) {
      // Respect anonymous settings, if any.
      const discussionPreferences = await pgdb.query(
        `
        SELECT
          "userId",
          "discussionId",
          anonymous
        FROM "discussionPreferences"
        WHERE
          "userId" = :userId;
      `,
        { userId }
      )
      return comments.map(comment => {
        const userPref = discussionPreferences.find(
          pref => pref.discussionId === comment.discussionId
        )
        if (!userPref || !userPref.anonymous) {
          return {
            ...comment,
            discussion: {
              id: comment.discussionId,
              title: comment.discussionTitle
            }
          }
        }
      })
    }
  }
}
