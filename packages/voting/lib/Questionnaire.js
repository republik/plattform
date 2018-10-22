const { buildQueries } = require('./queries.js')
const queries = buildQueries('questionnaires')

const getQuestions = async (questionnaire, pgdb) => {
  const questions = await pgdb.public.questions.find(
    { questionnaireId: questionnaire.id },
    { orderBy: { order: 'asc' } }
  )
  // console.log(questions)
  const transformedQuestions = questions.map(q => ({
    ...q,
    questionnaire,
    type: {
      type: q.type,
      ...q.typePayload
    }
  }))
  return transformedQuestions
}

module.exports = {
  ...queries,
  getQuestions
}
