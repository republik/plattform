const moment = require('moment')

const getIsExpired = ({ expYear, expMonth }) => {
  if (!expYear || !expMonth) {
    return true
  }
  return moment(`${expYear}-${expMonth}`, 'YYYY-MM')
    .endOf('month')
    .isBefore(moment())
}

module.exports = (source) =>
  source && {
    ...source,
    ...source.card,
    isExpired: getIsExpired(source.card || source),
  }
