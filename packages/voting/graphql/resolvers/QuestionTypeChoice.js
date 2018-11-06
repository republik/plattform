const { resultChoice } = require('../../lib/Question')

module.exports = {
  async result (question, args, context) {
    if (question.result !== undefined) {
      if (!question.result) {
        return question.result
      }
      const { top, min } = args
      let result = question.result
      if (min) {
        result = result.filter(r => r.count >= min)
      }
      if (top) {
        result = result.slice(0, top)
      }
      return result
    }
    if (!question.questionnaire.liveResult) {
      return null
    }
    return resultChoice(question, args, context)
  }
}
