const {
  getOptionsResult
} = require('../../lib/Voting')

module.exports = {
  async options (result, args, { pgdb }) {
    if (result.options) {
      return result.options
    }
    if (result.entity) {
      return getOptionsResult(result.entity, args, pgdb)
    }
    return null
  }
}
