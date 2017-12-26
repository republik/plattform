const { Roles } = require('@orbiting/backend-modules-auth')
const {dateRangeFilterWhere,
  stringArrayFilterWhere,
  booleanFilterWhere,
  andFilters
} = require('../../../lib/Filters')

const searchWhere = (search, prefix) => {
  if (!search) { return '' }
  return `
    ${prefix || ''}
    (hrid ILIKE :search OR
    "pspId" ILIKE :search)
  `
}

module.exports = async (
  _,
  { limit, offset, orderBy, search, dateRangeFilter, stringArrayFilter, booleanFilter },
  { pgdb, user }
) => {
  Roles.ensureUserHasRole(user, 'supporter')

  const orderByTerm = orderBy
    ? `"${orderBy.field}" ${orderBy.direction}`
    : '"createdAt" ASC'

  const options = {
    limit,
    offset,
    orderBy: orderByTerm
  }

  const items = !(search || dateRangeFilter || stringArrayFilter || booleanFilter)
    ? await pgdb.public.payments.findAll(options)
    : await pgdb.public.payments.findWhere(`
      ${andFilters([
        searchWhere(search),
        dateRangeFilterWhere(dateRangeFilter),
        stringArrayFilterWhere(stringArrayFilter),
        booleanFilterWhere(booleanFilter)
      ])}
    `, {
      search: search ? `${search.trim()}%` : null,
      fromDate: dateRangeFilter ? dateRangeFilter.from : null,
      toDate: dateRangeFilter ? dateRangeFilter.to : null,
      stringArray: stringArrayFilter ? stringArrayFilter.values : null,
      booleanValue: booleanFilter ? booleanFilter.value : null
    }, options)

  const count = await pgdb.public.payments.count()
  return { items, count }
}
