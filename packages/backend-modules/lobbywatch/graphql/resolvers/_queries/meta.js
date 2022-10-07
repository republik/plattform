const { mapMeta } = require('../../../lib/mappers')

module.exports = (_, { locale }, { loaders: { meta } }) => {
  return meta.load(locale).then((data) => mapMeta(locale, data))
}
