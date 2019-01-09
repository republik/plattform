const { Roles } = require('@orbiting/backend-modules-auth')
const {dateRangeFilterWhere,
  stringArrayFilterWhere,
  booleanFilterWhere,
  andFilters
} = require('../../../lib/Filters')

module.exports = async (
  _,
  { limit, offset, orderBy, search, dateRangeFilter, stringArrayFilter, booleanFilter },
  { pgdb, user }
) => {
  Roles.ensureUserHasRole(user, 'supporter')

  const orderByTerm = orderBy
    ? `"${orderBy.field}" ${orderBy.direction}`
    : '"createdAt" ASC'

  const filterActive = (dateRangeFilter || stringArrayFilter || booleanFilter)
  const andFiltersStmt = andFilters([
    dateRangeFilterWhere(dateRangeFilter),
    stringArrayFilterWhere(stringArrayFilter),
    booleanFilterWhere(booleanFilter)
  ])
  const items = await pgdb.query(`
    SELECT
      pfp.id AS id,
      ba.label AS konto,
      ba.iban AS iban,
      pfp.buchungsdatum AS buchungsdatum,
      pfp.valuta AS valuta,
      pfp.avisierungstext AS avisierungstext,
      pfp.gutschrift AS gutschrift,
      pfp.mitteilung AS mitteilung,
      pfp.matched AS matched,
      pfp.hidden AS hidden,
      pfp."createdAt" AS "createdAt",
      pfp."updatedAt" AS "updatedAt",
      concat_ws(' ',
        pfp.mitteilung::text,
        pfp.avisierungstext::text
      ) <->> :search AS word_sim
    FROM
      "postfinancePayments" pfp
    LEFT OUTER JOIN "bankAccounts" ba
      ON ba.id = pfp."bankAccountId"
    ${filterActive ? 'WHERE' : ''}
      ${andFiltersStmt}
    ORDER BY
      ${search ? 'word_sim' : orderByTerm}
    OFFSET :offset
    LIMIT :limit
  `, {
    search: search ? search.trim() : null,
    fromDate: dateRangeFilter ? dateRangeFilter.from : null,
    toDate: dateRangeFilter ? dateRangeFilter.to : null,
    stringArray: stringArrayFilter ? stringArrayFilter.values : null,
    booleanValue: booleanFilter ? booleanFilter.value : null,
    limit,
    offset
  })

  const count = await pgdb.public.postfinancePayments.count()
  return { items, count }
}
