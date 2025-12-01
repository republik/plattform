module.exports = {
  async membership(membershipPeriod, _args, { loaders }) {
    return loaders.Membership.byId.load(membershipPeriod.membershipId)
  },
}
