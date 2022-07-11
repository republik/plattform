const { turnout } = require('../../lib/Question')

module.exports = {
  __resolveType(question) {
    return `QuestionType${question.type}`
  },
  userAnswer: async (question, args, { user: me, loaders }) => {
    if (!me) {
      return null
    }
    if (question.userAnswer !== undefined) {
      return question.userAnswer
    }
    const [userAnswer] = await loaders.Answer.byKeyObj.load({
      questionId: question.id,
      userId: me.id,
    })

    return userAnswer
  },
  turnout: async (question, args, { pgdb }) => {
    const { result } = question
    if (result && result.turnout) {
      return result.turnout
    }
    return turnout(question, pgdb)
  },
}
