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
