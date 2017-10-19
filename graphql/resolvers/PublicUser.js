module.exports = {
  async testimonial (user, args, {pgdb}) {
    const testimonial = await pgdb.public.testimonials.findOne({userId: user.id})
    if (testimonial) {
      return {
        ...testimonial,
        name: user.name
      }
    }
  }
}
