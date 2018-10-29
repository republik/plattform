const { descending } = require('d3-array')

module.exports = {
  async result (question, { top }, { req, user: me, pgdb, t }) {
    if (question.result) {
      return question.result
    }
    if (!question.questionnaire.liveResult) {
      return null
    }
    const aggs = await pgdb.query(`
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
      ${top ? 'LIMIT :top' : ''}
    `, {
      questionId: question.id,
      top
    })
    const options = question.options
      .map(option => {
        const agg = aggs.find(a => a.value === option.value)
        return {
          option,
          count: (agg && agg.count) || 0
        }
      })
      .sort((a, b) => descending(a.count, b.count))
    return top
      ? options.slice(0, top)
      : options
  }
}
