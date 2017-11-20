const { getFormatter } = require('backend-modules-translate')
const MESSAGES = require('./translations.json').data
module.exports = getFormatter(MESSAGES)
