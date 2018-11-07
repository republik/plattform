const d3 = require('d3')

const validate = (value, question, { t }) => {
  if (typeof value !== 'number') {
    throw new Error(t('api/questionnaire/answer/wrongType'))
  }
  const values = question.typePayload.ticks.map(t => t.value)
  if (question.typePayload.kind === 'continous') {
    const min = Math.min(...values)
    const max = Math.max(...values)
    if (value < min || value > max) {
      throw new Error(t('api/questionnaire/answer/outOfRange'))
    }
  } else { // discrete
    if (values.find(v => v === value) === undefined) {
      throw new Error(t('api/questionnaire/answer/outOfRange'))
    }
  }
  return false
}

const result = async (question, args, context) => {
  const { pgdb } = context
  // queryOneColumn would be better but explodes
  // if no rows are selected
  const values = await pgdb.query(`
    SELECT
      payload->'value' as value
    FROM
      answers
    WHERE
      submitted = true AND
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
    questionTicks: question.ticks,
    values
  }
}

const resultHistogram = async (result, { ticks }, context) => {
  if (
    !result ||
    !result.questionTicks ||
    !result.values ||
    !result.values.length
  ) {
    return []
  }
  const { questionTicks, values } = result

  const numTicks = ticks ||
    ((questionTicks.length - 1) * 10)
  const extent = d3.extent(
    questionTicks.map(t => t.value)
  )
  const bins = d3.histogram()
    .domain(extent)
    .thresholds(
      d3.ticks(extent[0], extent[1], numTicks).slice(0, -1)
    )(values)

  return bins.map(bin => ({
    ...bin,
    count: bin.length
  }))
}

module.exports = {
  validate,
  result,
  resultHistogram
}
