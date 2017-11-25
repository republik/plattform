module.exports = {
  initials (user) {
    console.log(user)
    return user.name
      .split(' ')
      .map(p => p[0])
      .join('')
  },
  publicUser (user, args, { req }) {
    if (req.user.id === user.id) {
      return user
    }
    return null
  },
  async address (user, args, {pgdb}) {
    console.log('adsfasdf')
    if (!user.addressId) return null
    return pgdb.public.addresses.findOne({id: user.addressId})
  }
  // TODO: Implement memberships
  // TODO: Implement pledges
}
