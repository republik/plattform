const {
  getOptionsResult
} = require('../../lib/Voting')

module.exports = {
  async options (result, args, { pgdb, t }) {
    if (result.options) {
      return result.options
    }
    if (result.entity) {
      return getOptionsResult(result.entity, args, pgdb, t)
    }
    return null
  }
}
