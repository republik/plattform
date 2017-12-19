const _ = {
  uniqBy: require('lodash/uniqBy')
}
const { getFormatter } = require('@orbiting/backend-modules-translate')
const MESSAGES_CF = require('../modules/crowdfundings/lib/translations.json')
const MESSAGES = require('./translations.json').data
  .concat(MESSAGES_CF.data)
module.exports = getFormatter(_.uniqBy(MESSAGES, 'key'))
