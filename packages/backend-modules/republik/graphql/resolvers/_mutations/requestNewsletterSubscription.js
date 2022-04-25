module.exports = async (_, args, context) => {
  const { t } = context

  // Restore previous code if one can subscribe to new newsletter
  throw new Error(t('api/newsletters/request/notSupported'))
}
