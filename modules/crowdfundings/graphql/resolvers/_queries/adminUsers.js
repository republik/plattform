const { Roles } = require('@orbiting/backend-modules-auth')
const {dateRangeFilterWhere,
  stringArrayFilterWhere,
  booleanFilterWhere,
  andFilters
} = require('../../../lib/Filters')
const { transformUser } = require('@orbiting/backend-modules-auth')

module.exports = async (
  _,
  { limit, offset, orderBy, search, dateRangeFilter, stringArrayFilter, booleanFilter },
  { pgdb, user }
) => {
  Roles.ensureUserHasRole(user, 'supporter')

  const filterActive = (dateRangeFilter || stringArrayFilter || booleanFilter)
  let items = !(search || filterActive)
    ? await pgdb.public.users.findAll({
      limit,
      offset,
      orderBy: orderBy
        ? `"${orderBy.field}" ${orderBy.direction}`
        : '"createdAt" ASC'
    })
    : await pgdb.query(`
        SELECT
          u.*
          ${search ? `,
            concat_ws(' ',
              u."firstName"::text,
              u."lastName"::text,
              u.email::text,
              string_agg(a.name, ' '::text),
              string_agg(a.line1, ' '::text),
              string_agg(a.line2, ' '::text),
              string_agg(a.city, ' '::text),
              string_agg(a.country, ' '::text),
              string_agg(m."sequenceNumber"::text, ' '::text),
              string_agg(ps."pspId", ' '::text)
            ) <->> :search AS word_sim,
            concat_ws(' ',
              u."firstName"::text,
              u."lastName"::text,
              u.email::text,
              string_agg(a.name, ' '::text),
              string_agg(a.line1, ' '::text),
              string_agg(a.line2, ' '::text),
              string_agg(a.city, ' '::text),
              string_agg(a.country, ' '::text),
              string_agg(m."sequenceNumber"::text, ' '::text),
              string_agg(ps."pspId", ' '::text)
            ) <-> :search AS dist
          ` : ''}
        FROM
          users u
        LEFT JOIN
          addresses a
          ON a.id = u."addressId"
        LEFT JOIN
          memberships m
          ON m."userId" = u.id
        LEFT JOIN
          "paymentSources" ps
          ON ps."userId" = u.id
        ${filterActive ? 'WHERE' : ''}
          ${andFilters([
            dateRangeFilterWhere(dateRangeFilter, 'u'),
            stringArrayFilterWhere(stringArrayFilter, 'u'),
            booleanFilterWhere(booleanFilter, 'u')
          ])}
        GROUP BY
          u.id
        ORDER BY
          ${search ? 'word_sim, dist' : orderBy
            ? `u."${orderBy.field}" ${orderBy.direction}`
            : 'u."createdAt" ASC'
           }
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
  items = items.map(transformUser)
  const count = await pgdb.public.users.count()
  return { items, count }
}
