const utils = require('@orbiting/backend-modules-search/lib/utils')
const {
  paginate: { pageini },
} = require('@orbiting/backend-modules-utils')

const createAnswersQuery = (
  { userId, questionnaireId, search, filters = {} },
  { after, before } = {},
) => {
  const mustUserId = userId && { term: { userId } }
  const mustQuestionnaireId = questionnaireId && { term: { questionnaireId } }
  const mustSubmissionId = filters?.id && {
    term: { 'resolved.submission.id': filters.id },
  }
  const mustSearch = search && {
    simple_query_string: {
      query: search,
      fields: ['resolved.value.Text'],
      default_operator: 'AND',
    },
  }

  return {
    bool: {
      must: [
        mustUserId,
        mustQuestionnaireId,
        mustSubmissionId,
        mustSearch,
      ].filter(Boolean),
    },
  }
}

const createAnswersAggs = (
  { size, userId, questionnaireId, search, filters = {} },
  { after, before } = {},
) => {
  return {
    countSubmissions: {
      cardinality: {
        field: 'resolved.submission.id',
      },
    },
    submissionIds: {
      terms: {
        field: 'resolved.submission.id',
        size,
      },
    },
  }
}

const findAnswers = async (
  { size, userId, questionnaireId, search, filters, sort, anchor },
  { after, before },
  { elastic },
) => {
  try {
    const answersQuery = createAnswersQuery(
      { size, userId, questionnaireId, search, filters },
      { after, before },
    )

    const answersAggs = createAnswersAggs(
      { size, userId, questionnaireId, search, filters },
      { after, before },
    )

    const { body: answersBody } = await elastic.search({
      index: utils.getIndexAlias('answer', 'read'),
      size: 0,
      track_total_hits: true,
      body: {
        query: answersQuery,
        aggs: answersAggs,
      },
    })

    const { aggregations } = answersBody

    const countSubmissions = aggregations.countSubmissions.value
    const ids = aggregations.submissionIds.buckets.map(({ key }) => key)

    /* console.log(
      JSON.stringify({ answersQuery }, null, 2),
      JSON.stringify({ answersAggs }, null, 2),
      JSON.stringify({ answersBody }, null, 2),
      { countSubmissions, ids },
    ) */

    return { countSubmissions, ids }
  } catch (e) {}

  return { countSubmissions: 0, ids: [] }
}

const createSubmissionsFrom = (
  { ids, size, userId, questionnaireId, search, filters = {} },
  { after, before } = {},
) => {
  return 0
}

const createSubmissionsSize = (
  { ids, size, userId, questionnaireId, search, filters = {} },
  { after, before } = {},
) => {
  return size
}

const createSubmissionsSort = (
  { ids, size, userId, questionnaireId, search, filters = {}, sort, anchor },
  { after, before } = {},
) => {
  const isSortByCreatedAt = !sort?.by || sort.by === 'createdAt'
  const direction = sort?.direction || 'DESC'

  return [isSortByCreatedAt && { createdAt: direction }]
}

const createSubmissionsQuery = (
  {
    ids,
    size,
    userId,
    questionnaireId,
    search,
    filters = {},
    sort = {},
    anchor,
  },
  { after, before } = {},
) => {
  const mustSort =
    (!sort?.by || sort.by === 'createdAt') &&
    ((after?.anchor && {
      range: {
        createdAt: { [sort?.direction === 'ASC' ? 'gt' : 'lt']: after.anchor },
      },
    }) ||
      (before?.anchor && {
        range: {
          createdAt: {
            [sort?.direction === 'ASC' ? 'lt' : 'gt']: before.anchor,
          },
        },
      }))

  const mustIds = ids && { terms: { id: ids } }
  const mustUserId = userId && { term: { userId } }
  const mustQuestionnaireId = questionnaireId && { term: { questionnaireId } }
  const mustSubmissionId = filters?.id && { term: { id: filters.id } }

  return {
    bool: {
      must: [
        mustSort,
        mustIds,
        mustUserId,
        mustQuestionnaireId,
        mustSubmissionId,
      ].filter(Boolean),
    },
  }
}

const count = async (
  { userId, questionnaireId, search, filters },
  { elastic },
) => {
  try {
    const { countSubmissions } = await findAnswers(
      {
        userId,
        questionnaireId,
        search,
        filters,
      },
      {},
      { elastic },
    )

    return countSubmissions
  } catch (e) {
    console.warn(e.message)
  }

  return 0
}

const find = async (
  { size, userId, questionnaireId, search, filters, sort, anchor },
  { after, before },
  { elastic },
) => {
  try {
    const { ids } = search
      ? await findAnswers(
          { size, userId, questionnaireId, search, filters, sort, anchor },
          { after, before },
          { elastic },
        )
      : {}

    const submissionsFrom = createSubmissionsFrom(
      { ids, size, userId, questionnaireId, search, filters, sort, anchor },
      { after, before },
    )

    const submissionsSize = createSubmissionsSize(
      { ids, size, userId, questionnaireId, search, filters, sort, anchor },
      { after, before },
    )

    const submissionSort = createSubmissionsSort(
      { ids, size, userId, questionnaireId, search, filters, sort, anchor },
      { after, before },
    )
    const submissionsQuery = createSubmissionsQuery(
      { ids, size, userId, questionnaireId, search, filters, sort, anchor },
      { after, before },
    )

    /* console.log(
      JSON.stringify({ submissionsFrom, submissionsSize }, null, 2),
      JSON.stringify({ submissionSort }, null, 2),
      JSON.stringify({ submissionsQuery }, null, 2),
    ) */

    const { body: submissionsBody } = await elastic.search({
      index: utils.getIndexAlias('questionnairesubmission', 'read'),
      track_total_hits: true,
      from: submissionsFrom,
      size: submissionsSize,
      body: {
        sort: submissionSort,
        query: submissionsQuery,
      },
    })

    // console.log(JSON.stringify({ submissionsBody }, null, 2))

    // @TODO: Handle error …
    return submissionsBody.hits?.hits?.map((hit) => hit._source)
  } catch (e) {
    console.warn(e.message)
  }

  return []
}

const getConnection = (anchors, args, { elastic }) => {
  const { userId, questionnaireId } = anchors

  const countFn = (args) => {
    const { after, before } = args

    const search = after?.search || before?.search || args.search || undefined
    const filters = after?.filters || before?.filters || args.filters || {}

    return count({ userId, questionnaireId, search, filters }, { elastic })
  }

  const nodesFn = (args) => {
    const { after, before } = args

    const size = after?.first || before?.first || args.first || 10
    const search = after?.search || before?.search || args.search || undefined
    const filters = after?.filters || before?.filters || args.filters || {}
    const sort = after?.sort || before?.sort || args.sort || {}
    const anchor = after?.anchor || before?.anchor || args.anchor || undefined

    return find(
      { size, userId, questionnaireId, search, filters, sort, anchor },
      { after, before },
      { elastic },
    )
  }

  const pageInfoFn = (args, payload) => {
    const { after, before } = args
    const { nodes } = payload

    const first = after?.first || before?.first || args.first || 10
    const search = after?.search || before?.search || args?.search || undefined
    const filters = after?.filters || before?.filters || args?.filters || {}
    const sort = after?.sort || before?.sort || args?.sort || {}
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
        anchor: nodes[nodes.length - 1].createdAt,
        first,
        count,
        filters,
        sort,
      },
      hasPreviousPage: count > first,
      start: {
        anchor: nodes[0].createdAt,
        first,
        count,
        search,
        filters,
        sort,
      },
    }
  }

  return pageini(args, countFn, nodesFn, pageInfoFn)
}

module.exports = {
  count,
  find,
  getConnection,
}
