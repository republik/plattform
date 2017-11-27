// TODO: This is a plain copy from crowdfunding, we still need to review
// the schema for improvements.

module.exports = async (_, args, {pgdb}) => {
  const {offset, limit, search, firstId} = args
  const videosOnly = Object.hasOwnProperty.call(args, 'videosOnly') ? args.videosOnly : false
  const seed = Object.hasOwnProperty.call(args, 'seed') ? args.seed : Math.random() * 2 - 1

  let firstTestimonial
  let firstUser
  if (firstId) {
    firstTestimonial = await pgdb.public.testimonials.findOne({id: firstId})
    if (firstTestimonial) { firstUser = await pgdb.public.users.findOne({id: firstTestimonial.userId}) }
  }

  const results = (testimonials, users) => {
    if (firstTestimonial) {
      testimonials = testimonials.filter(testimonial => testimonial.id !== firstTestimonial.id)
      users.unshift(firstUser)
      testimonials.unshift(firstTestimonial)
    }
    return testimonials.map(testimonial => {
      const user = users.find(user => user.id === testimonial.userId)
      return Object.assign({}, testimonial, {
        name: `${user.firstName} ${user.lastName}`
      })
    })
  }

  if (search) {
    // search via users again to keep search ordering
    const testimonials = await pgdb.query(`
      SELECT
        t.id,
        t."userId",
        t.role,
        t.quote,
        t.video,
        t.image,
        t."smImage",
        t."sequenceNumber",
        t."createdAt",
        t."updatedAt"
      FROM users u
      JOIN testimonials t
      ON t."userId" = u.id
      WHERE
        t.published = true AND t."adminUnpublished" = false AND
        (u."firstName" % :search OR u."lastName" % :search OR
        u."firstName" ILIKE :searchLike OR u."lastName" ILIKE :searchLike OR
        t.role % :search OR t.role ILIKE :searchLike)
        ${videosOnly ? ' AND t.video IS NOT NULL' : ' '}
      OFFSET :offset
      LIMIT :limit;
    `, { search, searchLike: search + '%', seed, offset, limit })
    if (!testimonials.length) { return results([], []) }

    const users = await pgdb.public.users.find({id: testimonials.map(t => t.userId)})
    return results(testimonials, users)
  } else {
    const testimonials = await pgdb.query(`
      SELECT id, "userId", role, quote, video, image, "smImage", "sequenceNumber", "createdAt", "updatedAt"
      FROM (
        SELECT
          setseed(:seed),
          NULL AS id,
          NULL AS "userId",
          NULL AS role,
          NULL AS quote,
          NULL AS video,
          NULL AS image,
          NULL AS "smImage",
          NULL AS "sequenceNumber",
          NULL AS "createdAt",
          NULL AS "updatedAt"

        UNION ALL

        SELECT
          null,
          id,
          "userId",
          role,
          quote,
          video,
          image,
          "smImage",
          "sequenceNumber",
          "createdAt",
          "updatedAt"
        FROM testimonials t
        WHERE
          t.published = true AND t."adminUnpublished" = false
          ${videosOnly ? 'AND t.video IS NOT NULL' : ''}

        OFFSET 1
      ) s
      ORDER BY random()
      OFFSET :offset
      LIMIT :limit;
    `, { seed, offset, limit })
    if (!testimonials.length) { return results([], []) }

    const users = await pgdb.public.users.find({id: testimonials.map(t => t.userId)})
    return results(testimonials, users)
  }
}
