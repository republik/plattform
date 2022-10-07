const api = require('../../../lib/api')
const { ascending } = require('d3-array')
const { mapBranch, mapFormatterWithLocale } = require('../../../lib/mappers')

module.exports = (_, { locale }, { loaders: { translations } }) => {
  // const queriedFields = new Set(
  //   info.fieldNodes[0].selectionSet.selections.map(
  //     (node) => node.name.value
  //   )
  // )

  return Promise.all([
    translations.load(locale).then(mapFormatterWithLocale),
    api.data(locale, 'data/interface/v1/json/table/branche/flat/list'),
  ]).then(
    ([
      t,
      {
        json: { data: branchs },
      },
    ]) => {
      // default: sort by name
      branchs.sort((a, b) =>
        ascending(a.name.toLowerCase(), b.name.toLowerCase()),
      )

      return branchs.map((l) => mapBranch(l, t))
    },
  )
}
