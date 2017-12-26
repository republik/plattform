exports.andFilters = (filters) => {
  return filters.filter(Boolean).join(' AND ')
}

const prefixString = (prefix) => {
  return prefix
    ? prefix + '.'
    : ''
}

exports.dateRangeFilterWhere = (dateRangeFilter, table) => {
  if (!dateRangeFilter) { return null }
  return `
    (${prefixString(table)}"${dateRangeFilter.field}" >= :fromDate AND
     ${prefixString(table)}"${dateRangeFilter.field}" <= :toDate)
  `
}

exports.stringArrayFilterWhere = (stringArrayFilter, table) => {
  if (!stringArrayFilter) { return null }
  return `ARRAY[${prefixString(table)}"${stringArrayFilter.field}"] && :stringArray`
}

exports.booleanFilterWhere = (booleanFilter, table) => {
  if (!booleanFilter) { return null }
  return `${prefixString(table)}"${booleanFilter.field}" = :booleanValue`
}
