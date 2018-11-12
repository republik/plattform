const {
  isEligible,
  userHasSubmitted,
  userSubmitDate,
  getQuestions
} = require('../../lib/Questionnaire')

module.exports = {
  async userIsEligible (entity, args, { pgdb, user: me }) {
    return isEligible(me && me.id, entity, pgdb)
  },
  async userHasSubmitted (entity, args, { pgdb, user: me }) {
    return userHasSubmitted(entity.id, me && me.id, pgdb)
  },
  async userSubmitDate (entity, args, { pgdb, user: me }) {
    return userSubmitDate(entity.id, me && me.id, pgdb)
  },
  async questions (entity, args, { pgdb, user: me }) {
    return getQuestions(entity, args, pgdb)
  },
  async turnout (questionnaire, args, { pgdb }) {
    if (questionnaire.result && questionnaire.result.turnout) { // after counting
      return questionnaire.result.turnout
    }
    return { entity: questionnaire }
  }
}
