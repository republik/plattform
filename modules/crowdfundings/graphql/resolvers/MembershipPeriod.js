module.exports = {
  async membership (membershipPeriod, args, { pgdb }) {
    return pgdb.public.memberships.findOne({
      id: membershipPeriod.membershipId
    })
  }
}
