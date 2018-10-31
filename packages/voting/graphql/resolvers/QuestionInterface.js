module.exports = {
  __resolveType (question) {
    return `QuestionType${question.type}`
  },
  userAnswer: (question, args, { req, user: me, pgdb, t }) => {
    if (!me) {
      return null
    }
    if (question.userAnswer !== undefined) {
      return question.userAnswer
    }
    return pgdb.public.answers.findOne({
      questionId: question.id,
      userId: me.id
    })
  }
}
