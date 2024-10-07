const api = require('../../../lib/api')
const {
  mapGuest,
  guestIdPrefix,
  mapFormatterWithLocale,
} = require('../../../lib/mappers')

module.exports = async (_, { locale, id }, { loaders: { translations } }) => {
  const rawId = id.replace(guestIdPrefix, '')
  const [
    t,
    {
      json: { data: guest },
    },
  ] = await Promise.all([
    translations.load(locale).then(mapFormatterWithLocale),
    api.data(
      locale,
      `data/interface/v1/json/table/zutrittsberechtigung/aggregated/id/${encodeURIComponent(
        rawId,
      )}`,
    ),
  ])

  if (!guest.parlamentarier) {
    const {
      json: { data: parlamentarier },
    } = await api.data(
      locale,
      `data/interface/v1/json/table/parlamentarier/flat/id/${encodeURIComponent(
        guest.parlamentarier_id,
      )}`,
    )

    guest.parlamentarier = parlamentarier
  }

  return guest && mapGuest(guest, t)
}
