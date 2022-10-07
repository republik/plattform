const api = require('../../../lib/api')
const { mapPage } = require('../../../lib/mappers')

module.exports = (_, { locale, path }) => {
  const query = {
    'load-entity-refs': 'taxonomy_term,file',
    url: path.join('/'),
  }
  return api.drupal(locale, 'daten/page', query).then(
    ({ json, response }) => mapPage(locale, json, response.status),
    (error) => {
      if (error.response && error.response.status === 404) {
        return {
          nid: 0,
          type: 'page',
          statusCode: 404,
          title: '404',
          path: ['404'],
          translations: [],
          lead: '',
        }
      } else {
        throw error
      }
    },
  )
}
