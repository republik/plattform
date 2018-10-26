const { descending } = require('d3-array')

module.exports = {
  async result (question, args, { req, user: me, pgdb, t }) {
    if (question.result) {
      return question.result
    }
    if (!question.questionnaire.liveResult) {
      return null
    }
    const counts = await pgdb.query(`
      SELECT
        COUNT(*) AS count,
        jsonb_array_elements(payload->'value') as value
      FROM
        answers
      WHERE
        "questionId" = :questionId
      GROUP BY
        2
      ORDER BY
        1 DESC
    `, {
      questionId: question.id
    })
    return question.options
      .map(o => {
        const count = counts.find(c => c.value === o.value)
        return {
          option: o,
          count: (count && count.count) || 0
        }
      })
      .sort((a, b) => descending(a.count, b.count))
  }
}
