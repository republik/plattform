module.exports = {
  async type (membership, args, {pgdb}) {
    return pgdb.public.membershipTypes.findOne({id: membership.membershipTypeId})
  }
}
