const api = require('../../../lib/api')
const { ascending } = require('d3-array')
const { mapGuest, mapFormatterWithLocale } = require('../../../lib/mappers')

module.exports = (_, { locale }, { loaders: { translations } }, info) => {
  const queriedFields = new Set(
    info.fieldNodes[0].selectionSet.selections.map((node) => node.name.value),
  )

  if (queriedFields.has('connections')) {
    throw new Error('Connections currently only supported in getGuest')
  }
  if (queriedFields.has('parliamentarian')) {
    throw new Error('Parliamentarian currently only supported in getGuest')
  }

  return Promise.all([
    translations.load(locale).then(mapFormatterWithLocale),
    api.data(
      locale,
      'data/interface/v1/json/table/zutrittsberechtigung/flat/list',
    ),
  ]).then(
    ([
      t,
      {
        json: { data: guests },
      },
    ]) => {
      const result = (guests || []).map((g) => mapGuest(g, t))

      // default: sort by lastname
      result.sort((a, b) =>
        ascending(a.lastName.toLowerCase(), b.lastName.toLowerCase()),
      )

      return result
    },
  )
}
