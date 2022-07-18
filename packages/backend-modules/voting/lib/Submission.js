const utils = require('@orbiting/backend-modules-search/lib/utils')
const {
  paginate: { pageini },
} = require('@orbiting/backend-modules-utils')

const findMatchingAnswerIds = async ({ search, hits }, { elastic }) => {
  if (!search || !hits?.length) {
    return []
  }

  const answerIds = hits
    .map(({ _source }) => _source.resolved.answers.map((answer) => answer.id))
    .flat()

  const { body: answersBody } = await elastic.search({
    index: utils.getIndexAlias('answer', 'read'),
    size: answerIds.length,
    _source: ['_id'],
    body: {
      query: {
        bool: {
          must: [
            { terms: { _id: answerIds } },
            {
              simple_query_string: {
                query: search,
                fields: [
                  'payload.text',
                  'resolved.question.text',
                  'resolved.value.Text',
                  'resolved.value.Choice',
                ],
                default_operator: 'AND',
              },
            },
          ],
        },
      },
    },
  })

  return answersBody.hits.hits.map(({ _id }) => _id)
}

const createSubmissionsFrom = (
  { size, userId, questionnaireId, search, filters = {} },
  { after, before } = {},
) => {
  return after?.count || before?.count || 0
}

const createSubmissionsSize = (
  { size, userId, questionnaireId, search, filters = {} },
  { after, before } = {},
) => {
  return size
}

const createSubmissionsSort = (
  { size, userId, questionnaireId, search, filters = {}, sort },
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
    isMember,
    search,
    filters = {},
    sort = {},
    anchor,
  },
  { after, before } = {},
) => {
  const mustUserId = userId && { term: { userId } }
  const mustQuestionnaireId = questionnaireId && { term: { questionnaireId } }
  const mustSearch = search && {
    bool: {
      should: [
        {
          simple_query_string: {
            query: search,
            fields: [
              'resolved.answers.payload.text',
              'resolved.answers.resolved.question.text',
              'resolved.answers.resolved.value.Text',
              'resolved.answers.resolved.value.Choice',
            ],
            default_operator: 'AND',
          },
        },
        {
          bool: {
            must: [
              !isMember && {
                term: {
                  'resolved.user.hasPublicProfile': true,
                },
              },
              {
                simple_query_string: {
                  query: search,
                  fields: ['resolved.user.name'],
                  default_operator: 'AND',
                },
              },
            ].filter(Boolean),
          },
        },
      ],
    },
  }
  const mustSubmissionId = filters?.id && { term: { id: filters.id } }

  return {
    bool: {
      must: [
        mustUserId,
        mustQuestionnaireId,
        mustSearch,
        mustSubmissionId,
      ].filter(Boolean),
    },
  }
}

const count = async (
  { userId, questionnaireId, isMember, search, filters },
  { elastic },
) => {
  try {
    const submissionSort = createSubmissionsSort({
      userId,
      questionnaireId,
      isMember,
      search,
      filters,
    })

    const submissionsQuery = createSubmissionsQuery({
      userId,
      questionnaireId,
      isMember,
      search,
      filters,
    })

    const { body: submissionsBody } = await elastic.search({
      index: utils.getIndexAlias('questionnairesubmission', 'read'),
      track_total_hits: true,
      size: 0,
      body: {
        sort: submissionSort,
        query: submissionsQuery,
      },
    })

    const total = submissionsBody.hits.total
    return Number.isFinite(total?.value) ? total.value : total
  } catch (e) {
    console.warn(e.message)
  }

  return 0
}

const find = async (
  { size, userId, questionnaireId, isMember, search, filters, sort },
  { after, before },
  { elastic },
) => {
  try {
    const submissionsFrom = createSubmissionsFrom(
      { size, userId, questionnaireId, isMember, search, filters, sort },
      { after, before },
    )

    const submissionsSize = createSubmissionsSize(
      { size, userId, questionnaireId, isMember, search, filters, sort },
      { after, before },
    )

    const submissionSort = createSubmissionsSort(
      { size, userId, questionnaireId, isMember, search, filters, sort },
      { after, before },
    )
    const submissionsQuery = createSubmissionsQuery(
      { size, userId, questionnaireId, isMember, search, filters, sort },
      { after, before },
    )

    /* console.log(
      // JSON.stringify({ submissionsFrom, submissionsSize }, null, 2),
      // JSON.stringify({ submissionSort }, null, 2),
      // JSON.stringify({ submissionsQuery }, null, 2),
    ) */

    const { body: submissionsBody } = await elastic.search({
      index: utils.getIndexAlias('questionnairesubmission', 'read'),
      _source: { excludes: ['resolved.*'] },
      from: submissionsFrom,
      size: submissionsSize,
      body: {
        sort: submissionSort,
        query: submissionsQuery,
      },
    })

    // console.log(JSON.stringify({ submissionsBody }, null, 2))

    const hits = submissionsBody.hits.hits

    const _matchedAnswerIds = await findMatchingAnswerIds(
      { search, hits },
      { elastic },
    )

    return hits.map(({ _source }) => ({ ..._source, _matchedAnswerIds }))
  } catch (e) {
    console.warn(e.message)
  }

  return []
}

const getConnection = (anchors, args, context) => {
  const { userId, questionnaireId, isMember } = anchors
  const { elastic } = context

  const countFn = (args) => {
    const { after, before } = args

    const search = after?.search || before?.search || args.search || undefined
    const filters = after?.filters || before?.filters || args.filters || {}

    return count(
      { userId, questionnaireId, isMember, search, filters },
      { elastic },
    )
  }

  const nodesFn = (args) => {
    const { after, before } = args

    const size = Math.min(
      after?.first || before?.first || args.first || 10,
      100,
    )

    const search = after?.search || before?.search || args.search || undefined
    const filters = after?.filters || before?.filters || args.filters || {}
    const sort = after?.sort || before?.sort || args.sort || {}

    return find(
      { size, userId, questionnaireId, isMember, search, filters, sort },
      { after, before },
      { elastic },
    )
  }

  const pageInfoFn = (args, payload) => {
    const { after, before } = args
    const { nodes } = payload

    const first = Math.min(
      after?.first || before?.first || args.first || 10,
      100,
    )

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
        first,
        count,
        search,
        filters,
        sort,
      },
      hasPreviousPage: count > first,
      start: {
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
