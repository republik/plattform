const {
  paginate: { pageini },
} = require('@orbiting/backend-modules-utils')

const createCondition = (
  { userId, questionnaireId, filters = {} },
  { after, before } = {},
) => {
  const sort =
    (after?.createdAt && { 'createdAt <': after.createdAt }) ||
    (before?.createdAt && { 'createdAt >': before.createdAt }) ||
    {}

  const mustUserId = userId && { userId }
  const mustQuestionnaireId = questionnaireId && { questionnaireId }

  const and = [mustUserId, mustQuestionnaireId].filter(Boolean)

  return {
    ...sort,
    and,
  }
}

const createOrderBy = ({ after, before }) => ({
  createdAt: (after && 'desc') || (before && 'asc') || 'desc',
})

const count = async ({ userId, questionnaireId, filters }, pgdb) => {
  try {
    const count = await pgdb.public.questionnaireSubmissions.count(
      createCondition({ userId, questionnaireId, filters }),
    )

    return count
  } catch (e) {
    console.warn(e.message)
  }

  return 0
}

const find = async (
  { size, userId, questionnaireId, filters },
  { after, before },
  pgdb,
) => {
  try {
    const nodes = await pgdb.public.questionnaireSubmissions.find(
      createCondition({ userId, questionnaireId, filters }, { after, before }),
      { orderBy: createOrderBy({ after, before }), limit: size },
    )

    return nodes
  } catch (e) {
    console.warn(e.message)
  }

  return []
}

const getConnection = (anchors, args, { pgdb }) => {
  const { userId, questionnaireId } = anchors

  const countFn = (args) => {
    const { after, before } = args

    const filters = after?.filters || before?.filters || args.filters || {}

    return count({ userId, questionnaireId, filters }, pgdb)
  }

  const nodesFn = (args) => {
    const { after, before } = args

    const size = after?.first || before?.first || args.first || 10
    const filters = after?.filters || before?.filters || args.filters || {}

    return find(
      { size, userId, questionnaireId, filters },
      { after, before },
      pgdb,
    )
  }

  const pageInfoFn = (args, payload) => {
    const { after, before } = args
    const { nodes } = payload

    const first = after?.first || before?.first || args.first || 10
    const filters = after?.filters || before?.filters || args?.filters || {}
    const count =
      (after?.count && after.count + nodes.length) ||
      (before?.count && before.count - nodes.length) ||
      nodes.length

    if (!nodes.length) {
      return {
        hasNextPage: false,
        end: null,
        hasPreviousPage: false,
        start: null,
      }
    }

    return {
      hasNextPage: count < payload.totalCount,
      end: {
        first,
        createdAt: nodes[nodes.length - 1].createdAt,
        count,
        filters,
      },
      hasPreviousPage: count > first,
      start: { first, createdAt: nodes[0].createdAt, count, filters },
    }
  }

  return pageini(args, countFn, nodesFn, pageInfoFn)
}

module.exports = {
  count,
  find,
  getConnection,
}
