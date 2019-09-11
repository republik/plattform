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

const getResult = async (questionnaire, context) => {
  const { pgdb } = context

  const turnout = await queries.turnout(questionnaire, pgdb)
  const questionnaireWithTurnout = {
    ...questionnaire,
    turnout
  }

  const questions = await getQuestionsWithResults(questionnaireWithTurnout, context)
  const now = new Date()
  return {
    questions,
    turnout,
    updatedAt: now,
    createdAt: questionnaire.result ? questionnaire.result.createdAt : now
  }
}

const finalize = async (questionnaire, args, context) => {
  const result = getResult(questionnaire, context)
  return finalizeLib('questionnaires', questionnaire, result, args, context.pgdb)
}

const updateResultIncrementally = async (questionnaireId, answer, transaction, context) => {
  const { t } = context
  const questionnaire = await transaction.query(`
    SELECT *
    FROM questionnaires
    WHERE id = :questionnaireId
    FOR UPDATE
  `, {
    questionnaireId
  })
    .then(r => r && r[0])

  if (!questionnaire) {
    throw new Error(t(`api/questionnaire/404`))
  }

  let { result } = questionnaire
  if (!result) {
    result = await getResult(questionnaire, { ...context, pgdb: transaction })
  }

  const question = result.questions.find(q => q.id === answer.questionId)
  if (!question) {
    throw new Error(t('api/questionnaire/question/404'))
  }
  if (question.type !== 'Choice') {
    throw new Error(t('api/questionnaire/answer/updateResultIncrementally/choiceOnly'))
  }

  const { payload, turnout } = question.result
  if (!payload || !turnout) {
    console.error('result payload or turnout not found')
    throw new Error(t('api/unexpected'))
  }

  const optionPayload = payload
    .find(p => p.option.value == answer.payload.value) // eslint-disable-line eqeqeq

  if (!optionPayload) {
    console.error('optionPayload not found', payload)
    throw new Error(t('api/unexpected'))
  }

  turnout.submitted += 1
  optionPayload.count += 1
  result.updatedAt = new Date()

  await transaction.public.questionnaires.updateOne(
    { id: questionnaireId },
    { result }
  )
}

module.exports = {
  ...queries,
  transformQuestion,
  getQuestions,
  finalize,
  updateResultIncrementally
}
