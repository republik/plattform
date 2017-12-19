module.exports = {
  async type (membership, args, { pgdb }) {
    return pgdb.public.membershipTypes.findOne({
      id: membership.membershipTypeId
    })
  },
  async periods (membership, args, { pgdb }) {
    return pgdb.public.membershipPeriods.find({
      membershipId: membership.id
    })
  }
}
