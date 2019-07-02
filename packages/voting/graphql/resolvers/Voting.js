const {
  getOptions,
  isEligible,
  userHasSubmitted,
  userSubmitDate
} = require('../../lib/Voting')

module.exports = {
  slug ({ id, slug }) {
    return slug || id
  },
  async options (voting, args, { pgdb }) {
    return getOptions(voting.id, pgdb)
  },
  async discussion (voting, args, { pgdb }) {
    if (!voting.discussionId) {
      return
    }
    return pgdb.public.discussions.findOne({
      id: voting.discussionId
    })
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
  async turnout (voting, args, { pgdb }) {
    if (voting.result && voting.result.turnout) { // after counting
      return voting.result.turnout
    }
    return { entity: voting }
  },
  async groupTurnout (voting, args, { pgdb }) {
    if (voting.result && voting.result.groupTurnout) { // after counting
      return voting.result.groupTurnout
    }
    if (voting.groupSlug) {
      return { entity: voting, groupSlug: true }
    }
    return null
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
