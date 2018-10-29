const d3 = require('d3')
const { descending } = require('d3-array')

const rangeResult = async (question, args, context) => {
  const { pgdb } = context
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
    questionTicks: question.ticks,
    values
  }
}

const rangeResultHistogram = async (result, { ticks }, context) => {
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

const documentResult = async (question, { top }, context) => {
  const { pgdb } = context
  const docs = await pgdb.query(`
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
    .then(aggs => aggs.map(agg => ({
      count: agg.count,
      path: agg.path
    })))

  return docs.length
    ? docs
    : null
}

const choiceResult = async (question, { top }, context) => {
  const { pgdb } = context
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

const result = async (question, args, context) => {
  switch (question.type) {
    case 'Range':
      return rangeResult(question, args, context)
      // histogram not included in result, as we don't want to freeze it
    case 'Document':
      return documentResult(question, args, context)
    case 'Choice':
      return choiceResult(question, args, context)
  }
  return null
}

module.exports = {
  rangeResult,
  rangeResultHistogram,
  documentResult,
  choiceResult,
  result
}
