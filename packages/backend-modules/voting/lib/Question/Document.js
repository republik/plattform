const validate = async (value, question, context, payload) => {
  const { t } = context
  if (typeof value !== 'string') {
    throw new Error(t('api/questionnaire/answer/wrongType'))
  }
  if (value.length === 0) {
    return true
  } else {
    const doc = await context.loaders.Document.byPath.load(value)
    if (!doc) {
      throw new Error(
        t('api/questionnaire/answer/Document/404', { path: value }),
      )
    }
    // Sanity articles have no template, the document type stands in
    const requestedTemplate = question.typePayload.template
    if (requestedTemplate && requestedTemplate !== doc.sanityType) {
      throw new Error(
        t('api/questionnaire/answer/Document/wrongTemplate', {
          template: requestedTemplate,
        }),
      )
    }
    // save doc to payload
    payload.document = {
      title: doc.meta.title,
    }
  }
  return false
}

const result = async (question, { top, min }, context) => {
  const { pgdb } = context
  const docs = await pgdb
    .query(
      `
    SELECT
      COUNT(*) AS count,
      payload->'value' as path
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
  `,
      {
        questionId: question.id,
        top,
        min,
      },
    )
    .then((aggs) =>
      aggs.map((agg) => ({
        count: agg.count,
        path: agg.path,
      })),
    )

  return docs.length ? docs : null
}

module.exports = {
  validate,
  result,
}
