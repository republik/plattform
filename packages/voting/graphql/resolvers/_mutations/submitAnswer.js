const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const {
  findById,
  ensureReadyToSubmit
} = require('../../../lib/Questionnaire')
const { graphql: { resolvers: { queries: { document: getDocument } } } } = require('@orbiting/backend-modules-documents')

module.exports = async (_, { answer: { questionId, payload } }, context) => {
  const { pgdb, user: me, t, req } = context
  ensureSignedIn(req, t)

  const transaction = await pgdb.transactionBegin()
  try {
    const now = new Date()
    const question = await transaction.public.questions.findOne({ id: questionId })
    if (!question) {
      throw new Error(t('api/questionnaire/question/404'))
    }

    const questionnaire = await findById(question.questionnaireId, transaction)
    await ensureReadyToSubmit(questionnaire, me.id, now, transaction, t)

    // validate payload
    if (payload.value === undefined || payload.value === null) {
      throw new Error(t('api/questionnaire/answer/empty'))
    }

    let emptyAnswer = false
    const { value } = payload
    if (question.type === 'Text') {
      if (typeof value !== 'string') {
        throw new Error(t('api/questionnaire/answer/wrongType'))
      }
      if (value.length === 0) {
        emptyAnswer = true
      }
    } else if (question.type === 'Range') {
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
    } else if (question.type === 'Choice') {
      if (!Array.isArray(value)) {
        throw new Error(t('api/questionnaire/answer/wrongType'))
      }
      if (value.length === 0) {
        emptyAnswer = true
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
    } else if (question.type === 'Document') {
      if (typeof value !== 'string') {
        throw new Error(t('api/questionnaire/answer/wrongType'))
      }
      if (value.length === 0) {
        emptyAnswer = true
      } else {
        const doc = await getDocument(null, { path: value }, context)
        if (!doc) {
          throw new Error(t('api/questionnaire/answer/Document/404', { path: value }))
        }
        const requestedTemplate = question.typePayload.template
        if (requestedTemplate && requestedTemplate !== doc.meta.template) {
          throw new Error(t('api/questionnaire/answer/Document/wrongTemplate', { template: requestedTemplate }))
        }
      }
    } else {
      throw new Error(t('api/questionnaire/question/type/404', { type: question.type }))
    }

    const findQuery = {
      questionId,
      userId: me.id
    }
    const answerExists = await transaction.public.answers.findOne(findQuery)
    if (emptyAnswer) {
      if (answerExists) {
        await transaction.public.answers.deleteOne(findQuery)
      }
    } else {
      if (answerExists) {
        await transaction.public.answers.updateOne(
          findQuery,
          { payload }
        )
      } else {
        await transaction.public.answers.insert({
          questionId,
          userId: me.id,
          questionnaireId: questionnaire.id,
          payload
        })
      }
    }

    await transaction.transactionCommit()

    return pgdb.public.answers.findOne(findQuery)
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}
