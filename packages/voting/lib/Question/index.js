const {
  validate: validateChoice,
  result: resultChoice
} = require('./Choice')
const {
  validate: validateDocument,
  result: resultDocument
} = require('./Document')
const {
  validate: validateRange,
  result: resultRange,
  resultHistogram: resultRangeHistogram
} = require('./Range')
const {
  validate: validateText
} = require('./Text')

const validateAnswer = async (value, question, context, payload) => {
  const { t } = context
  switch (question.type) {
    case 'Text':
      return validateText(value, question, context)
    case 'Range':
      return validateRange(value, question, context)
    case 'Document':
      return validateDocument(value, question, context, payload) // async
    case 'Choice':
      return validateChoice(value, question, context)
    default:
      throw new Error(t('api/questionnaire/question/type/404', { type: question.type }))
  }
}

const resultForArchive = async (question, args, context) => {
  switch (question.type) {
    case 'Range':
      return resultRange(question, args, context)
      // histogram not included in result, as we don't want to freeze it
    case 'Document':
      return resultDocument(question, args, context)
    case 'Choice':
      return resultChoice(question, args, context)
  }
  return null
}

module.exports = {
  validateAnswer,
  resultForArchive,
  validateChoice,
  resultChoice,
  validateDocument,
  resultDocument,
  validateRange,
  resultRange,
  resultRangeHistogram,
  validateText
}
