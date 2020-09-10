// Finds latest period in a series of membershipPeriods
const getPeriodEndingLast =
  periods => periods
    .map(p => p)
    .reduce(
      (accumulator, currentValue) => {
        if (!accumulator) {
          return currentValue
        }

        return currentValue.endDate > accumulator.endDate
          ? currentValue
          : accumulator
      },
      false
    )

// Finds endDate furthest away in a series of membershipPeriods
const getLastEndDate = periods => getPeriodEndingLast(periods).endDate

module.exports = {
  getPeriodEndingLast,
  getLastEndDate
}
