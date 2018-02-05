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
  const items = !(search || filterActive)
    ? await pgdb.public.postfinancePayments.findAll({
      limit,
      offset,
      orderBy: orderByTerm
    })
    : await pgdb.query(`
        SELECT
          pfp.id AS id,
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
        ${filterActive ? 'WHERE' : ''}
          ${andFilters([
            dateRangeFilterWhere(dateRangeFilter),
            stringArrayFilterWhere(stringArrayFilter),
            booleanFilterWhere(booleanFilter)
          ])}
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
