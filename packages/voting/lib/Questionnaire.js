const { buildQueries } = require('./queries.js')
const queries = buildQueries('questionnaires')

const transformQuestion = (q, questionnaire) => ({
  ...q,
  questionnaire,
  type: {
    type: q.type,
    ...q.typePayload
  }
})

const getQuestionsWithAnswers = async (questionnaire, userId, pgdb) => {
  return pgdb.query(`
    SELECT
      q.*,
      json_agg(a.*)
        FILTER (WHERE a.id IS NOT NULL)
        AS "answer"
    FROM
      questions q
    LEFT JOIN
      answers a
      ON
        a."questionId" = q.id AND
        a."userId" = :userId
    WHERE
      q."questionnaireId" = :questionnaireId
    GROUP BY
      q.id
    ORDER BY
      q.order ASC
  `, {
    userId,
    questionnaireId: questionnaire.id
  })
    .then(questions => questions.map(q => ({
      ...transformQuestion(q, questionnaire),
      userAnswer: q.answer ? q.answer[0] : null
    })))
}

const getQuestions = async (questionnaire, pgdb) => {
  return pgdb.public.questions.find(
    { questionnaireId: questionnaire.id },
    { orderBy: { order: 'asc' } }
  )
    .then(questions => questions.map(q => transformQuestion(q, questionnaire)))
}

module.exports = {
  ...queries,
  getQuestionsWithAnswers,
  getQuestions
}
