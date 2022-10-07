const api = require('../../../lib/api')
const {
  mapOrganisation,
  orgIdPrefix,
  mapFormatterWithLocale,
} = require('../../../lib/mappers')

module.exports = (_, { locale, id }, { loaders: { translations } }) => {
  const rawId = id.replace(orgIdPrefix, '')
  return Promise.all([
    api.data(
      locale,
      `data/interface/v1/json/table/organisation/aggregated/id/${encodeURIComponent(
        rawId,
      )}`,
    ),
    translations.load(locale).then(mapFormatterWithLocale),
  ]).then(
    ([
      {
        json: { data: org },
      },
      t,
    ]) => {
      return org && mapOrganisation(org, t)
    },
  )
}
