const {
  numEligible,
  numSubmitted
} = require('../../lib/Voting')

module.exports = {
  async eligible (obj, args, { pgdb }) {
    if (obj.eligible || obj.eligitable) { // typo in old data
      return obj.eligible || obj.eligitable
    } else if (obj.entity) {
      return numEligible(obj.entity, pgdb)
    } else {
      return 0
    }
  },
  async submitted (obj, args, { pgdb }) {
    if (obj.submitted) {
      return obj.submitted
    } else if (obj.entity) {
      return numSubmitted(obj.entity.id, pgdb)
    } else {
      return 0
    }
  }
}
