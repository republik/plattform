const api = require('../../../lib/api')
const { ascending } = require('d3-array')
const {
  mapLobbyGroup,
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

  return Promise.all([
    translations.load(locale).then(mapFormatterWithLocale),
    api.data(locale, 'data/interface/v1/json/table/interessengruppe/flat/list'),
  ]).then(
    ([
      t,
      {
        json: { data: lobbyGroups },
      },
    ]) => {
      // default: sort by name
      lobbyGroups.sort((a, b) =>
        ascending(a.name.toLowerCase(), b.name.toLowerCase()),
      )

      return lobbyGroups.map((l) => mapLobbyGroup(l, t))
    },
  )
}
