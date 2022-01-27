const { resultChoice } = require('../../lib/Question')

module.exports = {
  options(question) {
    return question.options.filter((o) => !o.hidden)
  },
  async result(question, args, context) {
    if (question.result !== undefined) {
      const { payload } = question.result
      if (!payload) {
        return payload
      }
      const { top, min } = args
      let result = payload
      if (min) {
        result = result.filter((r) => r.count >= min)
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
  },
}
