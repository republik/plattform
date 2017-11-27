module.exports = async (_, args, {pgdb, req}) => {
  if (req.user) {
    return pgdb.public.pledges.findOne({
      id: args.id,
      userId: req.user.id
    })
  } else {
    const pledge = await pgdb.public.pledges.findOne({id: args.id})
    const user = await pgdb.public.users.findOne({id: pledge.userId})
    if (!user.verified) {
      return pledge
    } else {
      // user not logged in, but verified. Return pledge only if draft and user has no non-draft pledges
      // this is for:
      // a verified user without pledges can submit a new pledge without email verify,
      // so he must be able to retreive them later.
      const hasNonDraftPledges = await pgdb.public.pledges.findFirst({
        userId: user.id,
        'status !=': 'DRAFT'
      })
      if (pledge.status === 'DRAFT' && !hasNonDraftPledges) {
        return pledge
      }
    }
  }
  return null
}
