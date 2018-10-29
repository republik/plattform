const { rangeResultHistogram } = require('../../lib/Question')

module.exports = {
  histogram (result, args, context) {
    return rangeResultHistogram(result, args, context)
  }
}
