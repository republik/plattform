const d3 = require('d3')

module.exports = {
  histogram (result, { ticks }, context) {
    if (result.histogram) {
      return result.histogram
    }
    if (
      !result.question ||
      !result.question.questionnaire.liveResult ||
      !result.values ||
      !result.values.length
    ) {
      return null
    }
    const { question, values } = result

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
