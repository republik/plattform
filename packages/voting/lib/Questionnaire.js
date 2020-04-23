const { buildQueries } = require('./queries.js')
const queries = buildQueries('questionnaires')

const { resultForArchive } = require('./Question')
const finalizeLib = require('./finalize.js')
const { shuffle } = require('d3-array')

const transformQuestion = (q, questionnaire) => ({
  ...q.typePayload,
  ...q,
  questionnaire
})

const getQuestions = async (questionnaire, args = {}, pgdb) => {
  const {
    orderFilter,
    includeHidden = false
  } = args
  if (questionnaire.result) {
    return questionnaire.result.questions
      .map(question => ({
        ...question,
        questionnaire
      }))
      .filter(question => !orderFilter || orderFilter.indexOf(question.order) > -1)
      .filter(question => includeHidden || !question.hidden)
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

  const questions = await pgdb.public.questions.find(
    {
      questionnaireId: questionnaire.id,
      ...orderFilter ? { order: orderFilter } : {},
      ...includeHidden ? {} : { hidden: false }
    },
    { orderBy: { order: 'asc' } }
  )
    .then(questions => questions.map(q => transformQuestion(q, questionnaireWithTurnout)))

  if (args.shuffle) {
    // +1 for weights > 0
    const getWeight = (question) => question && question.metadata && question.metadata.weight + 1

    // use weighted shuffle
    const firstWeight = getWeight(questions[0])
    if (firstWeight !== null && firstWeight !== undefined && firstWeight !== false) {
      const sum = questions.reduce(
        (agg, q) => agg + getWeight(q),
        0
      )

      const pick = () => {
        let threshold = Math.floor(Math.random() * sum) + 1
        for (const q of questions) {
          threshold -= getWeight(q)
          if (threshold <= 0) {
            return q
          }
        }
      }

      const result = []
      for (let n = 0; n < args.shuffle; n++) {
        result.push(pick())
      }
      return result
    }

    return shuffle(questions)
      .slice(0, args.shuffle)
  }
  return questions
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
    throw new Error(t('api/questionnaire/404'))
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

const refreshResult = async (questionnaireId, transaction, context) => {
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
    throw new Error(t('api/questionnaire/404'))
  }

  const result = await getResult(questionnaire, { ...context, pgdb: transaction })

  result.updatedAt = new Date()

  return transaction.public.questionnaires.updateAndGetOne(
    { id: questionnaireId },
    { result }
  )
}

module.exports = {
  ...queries,
  transformQuestion,
  getQuestions,
  finalize,
  updateResultIncrementally,
  refreshResult
}
