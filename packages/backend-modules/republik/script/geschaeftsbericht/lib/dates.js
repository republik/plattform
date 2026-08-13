const dayjs = require('dayjs')
dayjs.extend(require('dayjs/plugin/utc'))
dayjs.extend(require('dayjs/plugin/timezone'))

const REPORT_TIMEZONE = 'Europe/Zurich'

// Parses a plain 'YYYY-MM-DD' date as a calendar date in Europe/Zurich and
// returns the LAST INSTANT of that day (23:59:59.999 Zurich time) as a
// timezone-aware dayjs object — independent of whatever timezone the
// process itself happens to run in (e.g. Heroku defaults to UTC).
//
// This matters: "Mitgliedschaften per 30.06." means "status at the end of
// 30.06.", not "status at 30.06. 00:00". Naively parsing '2026-06-30' with
// bare `dayjs(...)` and then formatting to 'YYYY-MM-DD' before sending to
// Postgres throws away all timezone info — Postgres then reinterprets the
// bare string using its own session timezone (commonly UTC), landing on
// 2026-06-30T00:00:00Z. That's ~22 hours before the intended
// 2026-06-30T21:59:59.999Z (= 30.06.2026 23:59:59.999 Zurich), silently
// excluding anyone who joined during the 30th and silently including
// anyone who left during the 30th. Always pass the result of this function
// (or a value derived from it via .add()/.subtract()/.endOf('month'), which
// preserve the timezone) as the query parameter — never re-parse it as a
// bare date string.
const endOfDayInZurich = (dateStr) =>
  dayjs.tz(dateStr, REPORT_TIMEZONE).endOf('day')

// Same reasoning as endOfDayInZurich, but for range boundaries (--from, and
// --to as an exclusive upper bound) where the start of the Zurich calendar
// day is what's wanted.
const startOfDayInZurich = (dateStr) =>
  dayjs.tz(dateStr, REPORT_TIMEZONE).startOf('day')

// Fiscal year label (e.g. "2025-2026") from its end date (30.06.).
const fiscalYearLabelFromAsOf = (asOf) => {
  const endYear = asOf.year()
  return `${endYear - 1}-${endYear}`
}

module.exports = {
  DEFAULT_AS_OF: '2026-06-30',
  DEFAULT_FY_FROM: '2025-07-01',
  DEFAULT_FY_TO: '2026-06-30',
  REPORT_TIMEZONE,
  endOfDayInZurich,
  startOfDayInZurich,
  fiscalYearLabelFromAsOf,
}
