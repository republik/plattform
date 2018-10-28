const { graphql: { resolvers: { queries: { document: getDocument } } } } = require('@orbiting/backend-modules-documents')

module.exports = {
  async result (question, { top }, context) {
    const { pgdb } = context
    if (question.result) {
      return question.result
    }
    if (!question.questionnaire.liveResult) {
      return null
    }
    return pgdb.query(`
      SELECT
        COUNT(*) AS count,
        payload->'value' as path
      FROM
        answers
      WHERE
        "questionId" = :questionId
      GROUP BY
        2
      ORDER BY
        1 DESC
      ${top ? 'LIMIT :top' : ''}
    `, {
      questionId: question.id,
      top
    })
      .then(aggs => aggs.map(async (agg) => {
        return {
          count: agg.count,
          document: await getDocument(null, { path: agg.path }, context)
        }
      }))
  }
}
