const api = require('../../../lib/api')
const { ascending } = require('d3-array')
const {
  mapParliamentarian,
  mapFormatterWithLocale,
} = require('../../../lib/mappers')

module.exports = (_, { locale }, { loaders: { translations } }, info) => {
  const queriedFields = new Set(
    info.fieldNodes[0].selectionSet.selections.map((node) => node.name.value),
  )

  if (queriedFields.has('connections')) {
    throw new Error(
      'Connections currently only supported in getParliamentarian',
    )
  }
  if (queriedFields.has('guests')) {
    throw new Error('Guests currently only supported in getParliamentarian')
  }

  return Promise.all([
    translations.load(locale).then(mapFormatterWithLocale),
    api.data(locale, 'data/interface/v1/json/table/parlamentarier/flat/list'),
    queriedFields.has('commissions') &&
      api.data(
        locale,
        'data/interface/v1/json/relation/in_kommission_liste/flat/list',
      ),
  ]).then(
    ([
      t,
      {
        json: { data: parliamentarians },
      },
      commissions,
    ]) => {
      if (commissions) {
        const commissionIndex = commissions.json.data.reduce(
          (index, commission) => {
            index[commission.parlamentarier_id] =
              index[commission.parlamentarier_id] || []
            index[commission.parlamentarier_id].push(commission)
            return index
          },
          {},
        )

        for (const parliamentarian of parliamentarians) {
          parliamentarian.in_kommission = commissionIndex[parliamentarian.id]
        }
      }

      const result = parliamentarians.map((p) => mapParliamentarian(p, t))

      // default: sort by lastname
      result.sort((a, b) =>
        ascending(a.lastName.toLowerCase(), b.lastName.toLowerCase()),
      )

      return result
    },
  )
}
