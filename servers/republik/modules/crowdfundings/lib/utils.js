// Finds latest endDate in a series of membershipPeriods
const getLatestEndDate =
  periods => periods
    .map(p => p.endDate)
    .reduce(
      (accumulator, currentValue) => {
        if (!accumulator) {
          return currentValue
        }

        return currentValue > accumulator ? currentValue : accumulator
      }
    )

module.exports = {
  getLatestEndDate
}
