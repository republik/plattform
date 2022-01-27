const getFormatter = require('./getFormatter')
const MESSAGES = require('./translations.json').data
module.exports = getFormatter(MESSAGES)
