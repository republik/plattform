const { mapFormatterWithLocale } = require('../../../lib/mappers')

module.exports = (
  _,
  { locale, term },
  { loaders: { translations, search } },
) => {
  return Promise.all([
    translations.load(locale).then(mapFormatterWithLocale),
    search.load(locale),
  ]).then(([t, search]) => search(term, t))
}
