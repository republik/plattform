const { resultRangeHistogram } = require('../../lib/Question')

module.exports = {
  histogram (result, args, context) {
    return resultRangeHistogram(result, args, context)
  }
}
