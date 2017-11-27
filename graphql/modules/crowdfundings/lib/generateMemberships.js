
module.exports = async (pledgeId, pgdb, t, logger = console) => {
  const pledge = await pgdb.public.pledges.findOne({id: pledgeId})
  const user = await pgdb.public.users.findOne({id: pledge.userId})

  // check if pledge really has no memberships yet
  if (await pgdb.public.memberships.count({pledgeId: pledge.id})) {
    logger.error('tried to generate memberships for a pledge which already has memberships', { pledge })
    throw new Error(t('api/unexpected'))
  }

  // get ingredients
  const pledgeOptions = await pgdb.public.pledgeOptions.find({pledgeId: pledge.id})
  const packageOptions = await pgdb.public.packageOptions.find({id: pledgeOptions.map((plo) => plo.templateId)})
  const rewards = await pgdb.public.rewards.find({
    id: packageOptions.map((pko) => pko.rewardId)
  })

  if (!rewards.length) { // it's a donation-only pledge
    return
  }

  const membershipTypes = await pgdb.public.membershipTypes.find({rewardId: rewards.map((r) => r.id)})
  // assemble tree
  rewards.forEach((r) => {
    r.membershipType = membershipTypes.find((mt) => r.id === mt.rewardId)
  })
  packageOptions.forEach((pko) => {
    pko.reward = rewards.find((r) => pko.rewardId === r.id)
  })
  pledgeOptions.forEach((plo) => {
    plo.packageOption = packageOptions.find((pko) => plo.templateId === pko.id)
  })

  // if the pledge has a negative donation:
  // 1) it's a one membership pledge
  // 2) this membership was bought for a reduced price
  // 3) this membership is not voucherable
  // voucherCodes get generated inside the db, but not for reducedPrice
  const reducedPrice = pledge.donation < 0

  const memberships = []
  pledgeOptions.forEach((plo) => {
    if (plo.packageOption.reward.type === 'MembershipType') {
      for (let c = 0; c < plo.amount; c++) {
        memberships.push({
          userId: user.id,
          pledgeId: pledge.id,
          membershipTypeId: plo.packageOption.reward.membershipType.id,
          beginDate: new Date(),
          reducedPrice
        })
      }
    }
  })
  await pgdb.public.memberships.insert(memberships)
}
