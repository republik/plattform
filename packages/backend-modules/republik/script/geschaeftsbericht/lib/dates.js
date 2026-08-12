// Fiscal year label (e.g. "2025-2026") from its end date (30.06.).
const fiscalYearLabelFromAsOf = (asOf) => {
  const endYear = asOf.year()
  return `${endYear - 1}-${endYear}`
}

// Fiscal year label from a [from, to) range, where `to` is the exclusive
// upper bound (e.g. 01.07. of the following year).
const fiscalYearLabelFromRange = (from, to) => {
  const startYear = from.year()
  const endYear = to.subtract(1, 'day').year()
  return `${startYear}-${endYear}`
}

module.exports = {
  DEFAULT_AS_OF: '2026-06-30',
  DEFAULT_FY_FROM: '2025-07-01',
  DEFAULT_FY_TO: '2026-07-01',
  fiscalYearLabelFromAsOf,
  fiscalYearLabelFromRange,
}
