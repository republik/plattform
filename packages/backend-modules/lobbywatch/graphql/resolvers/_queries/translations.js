module.exports = (_, { locale }, { loaders: { translations } }) => {
  return translations.load(locale)
}
