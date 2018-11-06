const { descending } = require('d3-array')

const validate = (value, question, { t }) => {
  if (!Array.isArray(value)) {
    throw new Error(t('api/questionnaire/answer/wrongType'))
  }
  if (value.length === 0) {
    return true
  } else {
    if (question.typePayload.cardinality > 0 && value.length > question.typePayload.cardinality) {
      throw new Error(t('api/questionnaire/answer/Choice/tooMany', { max: question.typePayload.cardinality }))
    }
    for (let v of value) {
      if (!question.typePayload.options.find(ov => ov.value === v)) {
        throw new Error(t('api/questionnaire/answer/Choice/value/404', { value: v }))
      }
    }
  }
  return false
}

const result = async (question, { top, min }, context) => {
  const { pgdb } = context
  const aggs = await pgdb.query(`
    SELECT
      COUNT(*) AS count,
      jsonb_array_elements(payload->'value') as value
    FROM
      answers
    WHERE
      submitted = true AND
      "questionId" = :questionId
    GROUP BY
      2
    ${min ? 'HAVING COUNT(*) >= :min' : ''}
    ORDER BY
      1 DESC
    ${top ? 'LIMIT :top' : ''}
  `, {
    questionId: question.id,
    top,
    min
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
  return options
}

module.exports = {
  validate,
  result
}
