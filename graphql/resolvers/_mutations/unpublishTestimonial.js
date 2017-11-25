const ensureSignedIn = require('../../../lib/ensureSignedIn')

module.exports = async (_, args, {pgdb, req, t}) => {
  ensureSignedIn(req, t)

  const testimonial = await pgdb.public.testimonials.findOne({userId: req.user.id})
  if (!testimonial) {
    console.error('user has no testimonial', args)
    throw new Error(t('api/unexpected'))
  }

  await pgdb.public.testimonials.updateOne({id: testimonial.id}, {
    published: false
  })
}
