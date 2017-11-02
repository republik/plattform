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
    const { limit } = args

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
  }
}
