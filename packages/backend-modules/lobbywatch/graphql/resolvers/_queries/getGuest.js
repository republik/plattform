const api = require('../../../lib/api')
const {
  mapGuest,
  guestIdPrefix,
  mapFormatterWithLocale,
} = require('../../../lib/mappers')

module.exports = (_, { locale, id }, { loaders: { translations } }) => {
  const rawId = id.replace(guestIdPrefix, '')
  return Promise.all([
    translations.load(locale).then(mapFormatterWithLocale),
    api.data(
      locale,
      `data/interface/v1/json/table/zutrittsberechtigung/aggregated/id/${encodeURIComponent(
        rawId,
      )}`,
    ),
  ]).then(
    ([
      t,
      {
        json: { data: guest },
      },
    ]) => {
      return guest && mapGuest(guest, t)
    },
  )
}
