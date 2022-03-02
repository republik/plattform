module.exports = {
  labels: (package, args, context) => {
    const { t } = context

    return {
      title: t('api/offer/package/title'),
      description: t('api/offer/package/description'),
      cta: t('api/offer/package/cta'),
    }
  }
}
