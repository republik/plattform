// Finds latest period in a series of membershipPeriods
const getPeriodEndingLast = (periods) =>
  periods
    .map((p) => p)
    .reduce((accumulator, currentValue) => {
      if (!accumulator) {
        return currentValue
      }

      return currentValue.endDate > accumulator.endDate
        ? currentValue
        : accumulator
    }, false)

// Finds endDate furthest away in a series of membershipPeriods
const getLastEndDate = (periods) => getPeriodEndingLast(periods).endDate

// Finds company (Republik or Project R) of given membership
const getMembershipCompany = (membership, pgdb) => {
  return pgdb.queryOneField(`
    SELECT c.name
    FROM "membershipTypes" mt
    JOIN companies c
      ON mt."companyId" = c.id
    WHERE mt.id = '${membership.membershipTypeId}'
    LIMIT 1
  `)
}

module.exports = {
  getPeriodEndingLast,
  getLastEndDate,
  getMembershipCompany,
}
