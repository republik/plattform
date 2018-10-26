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
    const x = d3.scaleLinear()
      .domain(d3.extent(question.ticks.map(t => t.value))).nice()
    const bins = d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(20))(values)
    return bins.map(bin => {
      bin.count = bin.length
      return bin
    })
  }
}
