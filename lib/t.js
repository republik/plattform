const { getFormatter } = require('./translate')
const MESSAGES = require('./translations.json').data

module.exports = getFormatter(MESSAGES)
