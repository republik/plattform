module.exports = {
  __resolveType (questionType) {
    return `QuestionType${questionType.type}`
  }
}
