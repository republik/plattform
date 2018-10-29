const { buildQueries } = require('./queries.js')
const queries = buildQueries('questionnaires')

const { result: getResult } = require('./Question')
const finalizeLib = require('./finalize.js')

const transformQuestion = (q, questionnaire) => ({
  ...q.typePayload,
  ...q,
  questionnaire
})

const getQuestions = async (questionnaire, pgdb) => {
  if (questionnaire.result) {
    return questionnaire.result.questions.map(question => ({
      ...question,
      questionnaire
    }))
  }
  return pgdb.public.questions.find(
    { questionnaireId: questionnaire.id },
    { orderBy: { order: 'asc' } }
  )
    .then(questions => questions.map(q => transformQuestion(q, questionnaire)))
}

const getQuestionsWithResults = async (questionnaire, context) => {
  const { pgdb } = context
  return getQuestions(questionnaire, pgdb)
    .then(questions => Promise.all(questions.map(async (question) => {
      return {
        ...question,
        questionnaire: null,
        result: await getResult(question, {}, context) || null
      }
    })))
}

const finalize = async (questionnaire, args, context) => {
  const questions = await getQuestionsWithResults(questionnaire, context)
  const result = {
    questions
  }
  return finalizeLib('questionnaires', questionnaire, result, args, context.pgdb)
}

module.exports = {
  ...queries,
  transformQuestion,
  getQuestions,
  finalize
}
