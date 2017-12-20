const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = {
  async memberships (user, args, {pgdb, user: me}) {
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter', 'accountant'])) {
      return pgdb.public.memberships.find({userId: user.id})
    }
    return []
  },
  async pledges (user, args, {pgdb, user: me}) {
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter', 'accountant'])) {
      return pgdb.public.pledges.find({userId: user.id})
    }
    return []
  },
  async testimonial (user, args, { pgdb, user: me }) {
    const testimonial = await pgdb.public.testimonials.findOne({
      userId: user.id
    })
    if (
      (testimonial.published && !testimonial.adminUnpublished) ||
      (me && me.id === testimonial.userId)
    ) {
      return {
        ...testimonial,
        name: user.name
      }
    }
  }
}
