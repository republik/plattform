const DataLoader = require('dataloader')
const gsheets = require('gsheets')
const LRU = require('lru-cache')
const { loadSearch } = require('./lib/search')
const api = require('./lib/api')
const translationJson = require('./translations.json')

const createDataLoaderLruCache = (options) => {
  return new LRU(options)
}

const mapTranslations = (locales, data) => {
  return locales.map((locale) => {
    const translations = data.map((translation) => ({
      key: translation.key,
      value: translation[locale],
    }))
    translations.locale = locale
    return translations
  })
}

const loadTranslations = !process.env.LIVE_TRANSLATIONS
  ? (locales) => {
      return Promise.resolve(mapTranslations(locales, translationJson.data))
    }
  : (locales) => {
      // const start = Date.now()
      return gsheets
        .getWorksheetById('1FhjogYL2SBxaJG3RfR01A7lWtb3XTE2dH8EtYdmdWXg', 'od6')
        .then((res) => {
          // const end = Date.now()
          // console.info(
          //   '[gsheets]',
          //   '1FhjogYL2SBxaJG3RfR01A7lWtb3XTE2dH8EtYdmdWXg',
          //   'od6',
          // )
          // console.info(`${end - start}ms`)
          return mapTranslations(locales, res.data)
        })
    }

const cachedTranslations = new DataLoader(loadTranslations, {
  cacheMap: createDataLoaderLruCache({
    max: 2,
    ttl: 30 * 1000, // ms
  }),
})

const cachedSearch = new DataLoader(loadSearch, {
  cacheMap: createDataLoaderLruCache({
    max: 2,
    ttl: 5 * 60 * 1000, // ms
  }),
})

const loadMeta = (locales) => {
  return Promise.all(
    locales.map((locale) =>
      api.drupal(locale, 'daten/meta').then(({ json }) => json),
    ),
  )
}

const cachedMeta = new DataLoader(loadMeta, {
  cacheMap: createDataLoaderLruCache({
    max: 2,
    ttl: 5 * 60 * 1000, // ms
  }),
})

module.exports = {
  translations: () => cachedTranslations,
  search: () => cachedSearch,
  meta: () => cachedMeta,
}
