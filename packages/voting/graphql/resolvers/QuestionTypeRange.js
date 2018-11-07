const { resultRange } = require('../../lib/Question')

module.exports = {
  async result (question, args, context) {
    if (question.result !== undefined) {
      return question.result.payload
    }
    if (!question.questionnaire.liveResult) {
      return null
    }
    return resultRange(question, args, context)
  }
}
