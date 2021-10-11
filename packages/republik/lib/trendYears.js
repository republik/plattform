const getYears = async (pgdb) => {
  const minYear = await pgdb.queryOneField(`
    SELECT 
      EXTRACT(YEAR FROM "beginDate") "minYear"
    FROM "membershipPeriods"
    ORDER BY 1
    LIMIT 1
  `)

  const maxYear = new Date().getFullYear()
  const years = []
  for (let year = minYear; year <= maxYear; year++) {
    year && years.push(year.toString())
  }
  return years
}

module.exports = {
  getYears,
}
