const getYears = async (pgdb) => {
  const minYearPeriod = await pgdb.query(`
    SELECT 
      EXTRACT(YEAR FROM "beginDate") "minYear"
    FROM "membershipPeriods"
    ORDER BY 1
    LIMIT 1
  `)

  const minYear = minYearPeriod[0].minYear
  const maxYear = new Date().getFullYear()
  const years = []
  for (let year = minYear; year <= maxYear; year++) {
    years.push(year.toString())
  }
  return years
}

module.exports = {
  getYears,
}
