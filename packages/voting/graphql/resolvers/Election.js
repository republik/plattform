const {
  isEligible,
  userHasSubmitted,
  userSubmitDate,
  getCandidacies
} = require('../../lib/Election')

module.exports = {
  // either result is freezed into db by countVoting or it must remain null.
  async discussion (election, args, { user: me, pgdb }) {
    return pgdb.public.discussions.findOne({ id: election.discussionId })
  },
  async candidacies (election, args, { user: me, pgdb }) {
    return getCandidacies(election, pgdb)
  },
  async userIsEligible (entity, args, { pgdb, user: me }) {
    return isEligible(me && me.id, entity, pgdb)
  },
  async userHasSubmitted (entity, args, { pgdb, user: me }) {
    return userHasSubmitted(entity.id, me && me.id, pgdb)
  },
  async userSubmitDate (entity, args, { pgdb, user: me }) {
    return userSubmitDate(entity.id, me && me.id, pgdb)
  },
  async turnout (election, args, { pgdb }) {
    if (election.result && election.result.turnout) { // after counting
      return election.result.turnout
    }
    return { entity: election }
  },
  async result (entity, args, { pgdb }) {
    if (entity.result) {
      return entity.result
    }
    if (!entity.liveResult) {
      return null
    }
    return { entity }
  }
}
