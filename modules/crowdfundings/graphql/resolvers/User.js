module.exports = {
  async memberships (user, args, {pgdb}) {
    return pgdb.public.memberships.find({userId: user.id})
  },
  async pledges (user, args, {pgdb}) {
    return pgdb.public.pledges.find({userId: user.id})
  },
  async testimonial (user, args, {pgdb}) {
    const testimonial = await pgdb.public.testimonials.findOne({userId: user.id})
    if (testimonial) {
      return Object.assign({}, testimonial, {
        name: `${user.firstName} ${user.lastName}`
      })
    }
    return null
  }
}
