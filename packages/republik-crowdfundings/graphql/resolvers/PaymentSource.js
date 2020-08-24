const moment = require('moment')

module.exports = {
  isExpired: ({ expYear, expMonth }, args, {pgdb}) => {
    if (!expYear || !expMonth) {
      return true
    }
    return moment(`${expYear}-${expMonth}`, 'YYYY-MM')
      .endOf('month')
      .isBefore(moment())
  }
}
