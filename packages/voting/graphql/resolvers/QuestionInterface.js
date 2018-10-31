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
  },
  turnout: async (question, args, { pgdb }) => {
    const { id: questionId, questionnaireId } = question
    const numSubmittedQuestionnaires = await pgdb.public.questionnaireSubmissions.count({
      questionnaireId
    })
    const numSubmittedAnswers = await pgdb.public.answers.count({
      submitted: true,
      questionId
    })
    return {
      submitted: numSubmittedAnswers,
      skipped: numSubmittedQuestionnaires-numSubmittedAnswers
    }
  }
}
