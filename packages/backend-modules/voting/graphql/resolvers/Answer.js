module.exports = {
  question: (answer, args, { pgdb }) => {
    return pgdb.public.questions.findOne({ id: answer.questionId })
  },
}
