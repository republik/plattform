const moment = require('moment')

module.exports = {
  isExpired: ({ expYear, expMonth }, args, {pgdb}) =>
    moment(`${expYear}-${expMonth}`, 'YYYY-MM')
      .endOf('month')
      .isBefore(moment())
}
