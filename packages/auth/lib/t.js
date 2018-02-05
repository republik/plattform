const { getFormatter } = require('@orbiting/backend-modules-translate')
const MESSAGES = require('./translations.json').data

module.exports = getFormatter(MESSAGES)
