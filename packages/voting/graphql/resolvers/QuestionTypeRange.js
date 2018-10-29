const d3 = require('d3')

module.exports = {
  async result (question, { ticks }, context) {
    const { pgdb } = context
    if (question.result) {
      return question.result
    }
    if (!question.questionnaire.liveResult) {
      return null
    }
    const values = await pgdb.queryOneColumn(`
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
    const numTicks = ticks ||
      ((question.ticks.length - 1) * 10)
    const extent = d3.extent(
      question.ticks.map(t => t.value)
    )
    const x = d3.scaleLinear()
      .domain(extent).nice()
    const bins = d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(numTicks))(values)
    return bins.map(bin => ({
      ...bin,
      count: bin.length
    }))
  }
}
