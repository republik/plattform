const { rangeResult } = require('../../lib/Question')

module.exports = {
  async result (question, args, context) {
    if (question.result !== undefined) {
      return question.result
    }
    if (!question.questionnaire.liveResult) {
      return null
    }
    return rangeResult(question, args, context)
  }
}
