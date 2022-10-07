const api = require('../../../lib/api')
const {
  mapParliamentarian,
  parliamentarianIdPrefix,
  mapFormatterWithLocale,
} = require('../../../lib/mappers')

module.exports = (_, { locale, id }, { loaders: { translations } }) => {
  const rawId = id.replace(parliamentarianIdPrefix, '')
  // ToDo handle inactive – could send `includeInactive=1` but would need permission fixing on php side
  return Promise.all([
    api.data(
      locale,
      `data/interface/v1/json/table/parlamentarier/aggregated/id/${encodeURIComponent(
        rawId,
      )}`,
    ),
    translations.load(locale).then(mapFormatterWithLocale),
  ]).then(
    ([
      {
        json: { data: parliamentarian },
      },
      t,
    ]) => {
      return parliamentarian && mapParliamentarian(parliamentarian, t)
    },
  )
}
