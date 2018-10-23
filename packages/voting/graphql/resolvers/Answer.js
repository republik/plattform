module.exports = {
  question: (answer, args, { user: me, pgdb }) => {
    return pgdb.public.questions.findOne({ id: answer.questionId })
  }
}
