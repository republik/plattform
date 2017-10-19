module.exports = {
  name (user) {
    return [user.firstName, user.lastName].join(' ')
  },
  async address (user, args, {pgdb}) {
    if (!user.addressId) return null
    return pgdb.public.addresses.findOne({id: user.addressId})
  }
  // TODO: Implement memberships
  // TODO: Implement pledges
}
