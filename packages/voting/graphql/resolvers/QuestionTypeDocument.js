const { resultDocument } = require('../../lib/Question')

module.exports = {
  async result (question, args, context) {
    if (question.result !== undefined) {
      const { payload } = question.result
      if (!payload) {
        return payload
      }
      const { top, min } = args
      let result = payload
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
    return resultDocument(question, args, context)
  }
}
