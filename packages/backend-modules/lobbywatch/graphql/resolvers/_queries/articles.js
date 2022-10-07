const api = require('../../../lib/api')
const { mapPage } = require('../../../lib/mappers')

module.exports = (_, { locale, limit, page }) => {
  const query = {
    'load-entity-refs': 'taxonomy_term,file',
    limit,
    page,
  }

  return api.drupal(locale, 'daten/articles', query).then(({ json }) => {
    return {
      pages: +json.pages,
      list: json.list.map((article) => mapPage(locale, article)),
    }
  })
}
