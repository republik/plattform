const { turnout } = require('../../lib/Question')

module.exports = {
  __resolveType (question) {
    return `QuestionType${question.type}`
  },
  userAnswer: (question, args, { req, user: me, pgdb, t, loaders }) => {
    if (!me) {
      return null
    }
    if (question.userAnswer !== undefined) {
      return question.userAnswer
    }
    return loaders.Answer.byKeyObj.load({
      questionId: question.id,
      userId: me.id
    })
  },
  turnout: async (question, args, { pgdb }) => {
    const { result } = question
    if (result && result.turnout) {
      return result.turnout
    }
    return turnout(question, pgdb)
  }
}
