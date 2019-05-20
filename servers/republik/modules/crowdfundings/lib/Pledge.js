exports.minTotal = (pledgeOptions, packageOptions) => Math.max(pledgeOptions.reduce(
  (price, plo) => {
    const pko = packageOptions.find((pko) => pko.id === plo.templateId)
    const periods =
      plo.periods ||
      (pko.reward && pko.reward.defaultPeriods) ||
      1

    return price + (
      pko.userPrice
        ? (pko.minUserPrice * periods * plo.amount)
        : (pko.price * periods * plo.amount)
    )
  }, 0
), 100)

exports.regularTotal = (pledgeOptions, packageOptions) => Math.max(pledgeOptions.reduce(
  (price, plo) => {
    const pko = packageOptions.find((pko) => pko.id === plo.templateId)
    const periods =
      plo.periods ||
      (pko.reward && pko.reward.defaultPeriods) ||
      1

    return price + (pko.price * periods * plo.amount)
  }, 0
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

exports.cancel = require('./Pledge/cancel')
