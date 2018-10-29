const d3 = require('d3')

module.exports = {
  async result (question, args, context) {
    const { pgdb } = context
    if (question.result) {
      return question.result
    }
    if (!question.questionnaire.liveResult) {
      return null
    }
    // queryOneColumn would be better but explodes
    // if no rows are selected
    const values = await pgdb.query(`
      SELECT
        payload->'value' as value
      FROM
        answers
      WHERE
        "questionId" = :questionId
      ORDER BY
        1 ASC
    `, {
      questionId: question.id
    })
      .then(rows => rows.map(r => r.value))
    if (!values.length) {
      return null
    }

    return {
      mean: d3.mean(values),
      median: d3.median(values),
      deviation: d3.deviation(values),
      // for downstream resolvers
      question,
      values
    }
  }
}
