exports.minTotal = (pledgeOptions, packageOptions) => Math.max(pledgeOptions.reduce(
  (amount, plo) => {
    const pko = packageOptions.find((pko) => pko.id === plo.templateId)
    return amount + (pko.userPrice
      ? (pko.minUserPrice * plo.amount)
      : (pko.price * plo.amount))
  }
  , 0
), 100)

exports.regularTotal = (pledgeOptions, packageOptions) => Math.max(pledgeOptions.reduce(
  (amount, plo) => {
    const pko = packageOptions.find((pko) => pko.id === plo.templateId)
    return amount + (pko.price * plo.amount)
  }
  , 0
), 100)

exports.getPledgeOptionsTree = async (pledgeOptions, pgdb) => {
  const packageOptions = await pgdb.public.packageOptions.find({
    id: pledgeOptions.map(plo => plo.templateId)
  })
  const rewards = await pgdb.public.rewards.find({
    id: packageOptions.map(pko => pko.rewardId)
  })

  // assemble tree
  if (rewards.length) {
    const membershipTypes = await pgdb.public.membershipTypes.find({
      rewardId: rewards.map(r => r.id)
    })
    rewards.forEach(r => {
      r.membershipType = membershipTypes.find((mt) => r.id === mt.rewardId)
    })
    packageOptions.forEach(pko => {
      pko.reward = rewards.find((r) => pko.rewardId === r.id)
    })
  }
  const newPledgeOptions = pledgeOptions.map(plo => ({
    ...plo,
    packageOption: packageOptions.find(pko => plo.templateId === pko.id)
  }))

  return newPledgeOptions
}
