module.exports = {
  __resolveType (question) {
    return `QuestionType${question.type}`
  }
}
