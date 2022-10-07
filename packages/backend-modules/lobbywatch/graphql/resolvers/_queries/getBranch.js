const api = require('../../../lib/api')
const {
  mapBranch,
  branchIdPrefix,
  mapFormatterWithLocale,
} = require('../../../lib/mappers')

module.exports = (_, { locale, id }, { loaders: { translations } }) => {
  const rawId = id.replace(branchIdPrefix, '')
  return Promise.all([
    api.data(
      locale,
      `data/interface/v1/json/table/branche/aggregated/id/${encodeURIComponent(
        rawId,
      )}`,
    ),
    translations.load(locale).then(mapFormatterWithLocale),
  ]).then(
    ([
      {
        json: { data: branch },
      },
      t,
    ]) => {
      return branch && mapBranch(branch, t)
    },
  )
}
