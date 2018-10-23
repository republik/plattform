const {
  isEligible,
  userHasSubmitted,
  userSubmitDate,
  getQuestionsWithAnswers,
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
    if (me) {
      return getQuestionsWithAnswers(entity, me.id, pgdb)
    }
    return getQuestions(entity, pgdb)
  }
}
