const {
  getCandidaciesResult
} = require('../../lib/Election')

module.exports = {
  async candidacies (result, args, { pgdb, t }) {
    if (result.candidacies) {
      return result.candidacies
    }
    if (result.entity) {
      return getCandidaciesResult(result.entity, args, pgdb, t)
    }
    return null
  }
}
