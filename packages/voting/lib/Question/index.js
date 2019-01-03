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

const turnout = async (question, pgdb) => {
  const { numSubmitted: getNumSubmittedQuestionnaires } = require('../Questionnaire')
  const { id: questionId, questionnaireId } = question
  const numSubmittedQuestionnaires =
    (question.questionnaire.turnout && question.questionnaire.turnout.submitted) ||
    await getNumSubmittedQuestionnaires(questionnaireId, pgdb)
  const numSubmittedAnswers = await pgdb.public.answers.count({
    submitted: true,
    questionId
  })
  return {
    submitted: numSubmittedAnswers,
    skipped: numSubmittedQuestionnaires - numSubmittedAnswers
  }
}

const resultForArchive = async (question, args, context) => {
  let payload
  switch (question.type) {
    case 'Range':
      payload = await resultRange(question, args, context)
      // histogram not included in result, as we don't want to freeze it
      break
    case 'Document':
      payload = await resultDocument(question, args, context)
      break
    case 'Choice':
      payload = await resultChoice(question, args, context)
      break
  }
  return {
    payload,
    turnout: await turnout(question, context.pgdb)
  }
}

module.exports = {
  validateAnswer,
  turnout,
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
