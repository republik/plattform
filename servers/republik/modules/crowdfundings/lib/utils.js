// Finds latest period in a series of membershipPeriods
const getLatestPeriod =
  periods => periods
    .map(p => p)
    .reduce(
      (accumulator, currentValue) => {
        if (!accumulator) {
          return currentValue
        }

        return currentValue.createdAt > accumulator.createdAt
          ? currentValue
          : accumulator
      }
    )

// Finds latest endDate in a series of membershipPeriods
const getLatestEndDate = periods => getLatestPeriod(periods).endDate

module.exports = {
  getLatestEndDate,
  getLatestPeriod
}
