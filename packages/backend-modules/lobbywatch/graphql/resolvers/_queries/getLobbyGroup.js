const api = require('../../../lib/api')
const {
  mapLobbyGroup,
  lobbyGroupIdPrefix,
  mapFormatterWithLocale,
} = require('../../../lib/mappers')

module.exports = (_, { locale, id }, { loaders: { translations } }) => {
  const rawId = id.replace(lobbyGroupIdPrefix, '')
  return Promise.all([
    api.data(
      locale,
      `data/interface/v1/json/table/interessengruppe/aggregated/id/${encodeURIComponent(
        rawId,
      )}`,
    ),
    translations.load(locale).then(mapFormatterWithLocale),
  ]).then(
    ([
      {
        json: { data: lobbyGroup },
      },
      t,
    ]) => {
      return lobbyGroup && mapLobbyGroup(lobbyGroup, t)
    },
  )
}
