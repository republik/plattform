const { buildQueries } = require('./queries.js')
const queries = buildQueries('questionnaires')

const { resultForArchive } = require('./Question')
const finalizeLib = require('./finalize.js')

const transformQuestion = (q, questionnaire) => ({
  ...q.typePayload,
  ...q,
  questionnaire
})

const getQuestions = async (questionnaire, args = {}, pgdb) => {
  const { orderFilter } = args
  if (questionnaire.result) {
    return questionnaire.result.questions
      .map(question => ({
        ...question,
        questionnaire
      }))
      .filter(question => !orderFilter || orderFilter.indexOf(question.order) > -1)
  }
  // add turnout to questionnaire for downstream resolvers
  const turnout =
    (questionnaire.result && questionnaire.result.turnout) ||
    questionnaire.turnout ||
    await queries.turnout(questionnaire, pgdb)
  const questionnaireWithTurnout = {
    turnout,
    ...questionnaire
  }
  return pgdb.public.questions.find(
    {
      questionnaireId: questionnaire.id,
      ...orderFilter ? { order: orderFilter } : {}
    },
    { orderBy: { order: 'asc' } }
  )
    .then(questions => questions.map(q => transformQuestion(q, questionnaireWithTurnout)))
}

const getQuestionsWithResults = async (questionnaire, context) => {
  const { pgdb } = context
  return getQuestions(questionnaire, {}, pgdb)
    .then(questions => Promise.all(questions.map(async (question) => {
      return {
        ...question,
        questionnaire: null,
        result: await resultForArchive(question, {}, context) || null
      }
    })))
}

const finalize = async (questionnaire, args, context) => {
  const turnout = await queries.turnout(questionnaire, context.pgdb)
  const questionnaireWithTurnout = {
    ...questionnaire,
    turnout
  }
  const questions = await getQuestionsWithResults(questionnaireWithTurnout, context)
  const result = {
    questions,
    turnout
  }
  return finalizeLib('questionnaires', questionnaire, result, args, context.pgdb)
}

module.exports = {
  ...queries,
  transformQuestion,
  getQuestions,
  finalize
}
