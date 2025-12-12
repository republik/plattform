const utils = require('@orbiting/backend-modules-search/lib/utils')
const {
  paginate: { pageini },
} = require('@orbiting/backend-modules-utils')

const createSubmissionsFrom = (_, { after, before } = {}) =>
  after?.count || before?.count || 0

const createSubmissionsSize = ({ size }) => size

const createSubmissionsSort = ({ sort }) => {
  const isSortByCreatedAt = !sort?.by || sort.by === 'createdAt'
  const direction = sort?.direction || 'DESC'

  return [isSortByCreatedAt && { createdAt: direction }].filter(Boolean)
}

const createSubmissionsQuery = ({
  userId,
  questionnaireId,
  isMember,
  search,
  value,
  filters = {},
  sort = {},
}) => {
  const { by, date } = sort

  const mustBeforeDate = date && {
    range: {
      createdAt: {
        lte: sort?.date,
      },
    },
  }
  const mustUserId = userId && { term: { userId } }
  const mustUserIds = filters?.userIds && {
    terms: { userId: filters.userIds },
  }
  const mustQuestionnaireId = questionnaireId && { term: { questionnaireId } }
  const mustSubmissionId = filters?.id && { term: { id: filters.id } }
  const mustNotSubmissionId = filters?.not && { term: { id: filters.not } }
  const mustSubmissionIds = filters?.submissionIds?.length && {
    terms: { id: filters.submissionIds },
  }
  const mustNotSubmissionIds = filters?.notSubmissionIds?.length && {
    terms: { id: filters.notSubmissionIds },
  }

  const mustHaveSomeAnswers = {
    nested: {
      path: 'resolved.answers',
      query: { exists: { field: 'resolved.answers' } },
    },
  }

  const mustSearch = search && {
    bool: {
      should: [
        {
          nested: {
            path: 'resolved.answers',
            query: {
              simple_query_string: {
                query: search,
                fields: [
                  'resolved.answers.payload.text',
                  'resolved.answers.resolved.question.text',
                  'resolved.answers.resolved.value.Text',
                  'resolved.answers.resolved.value.Choice',
                  'resolved.answers.resolved.value.ImageChoice',
                ],
                default_operator: 'AND',
              },
            },
            inner_hits: {
              fields: ['id'],
            },
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

  const mustValue = value && {
    nested: {
      path: 'resolved.answers',
      query: { term: { 'resolved.answers.payload.value': value } },
      inner_hits: {
        fields: ['id'],
      },
    },
  }

  const expectedAnswers = (filters?.answeredQuestionIds || [])
    .map((questionId) => ({
      questionId,
    }))
    .concat(filters?.answers || [])

  const mustHaveAnswers = expectedAnswers?.length && {
    bool: {
      must: expectedAnswers.map(({ questionId, valueLength }) => {
        return {
          nested: {
            path: 'resolved.answers',
            query: {
              bool: {
                must: [
                  { term: { 'resolved.answers.questionId': questionId } },
                  valueLength && {
                    range: {
                      'resolved.answers.resolved.value.length': {
                        gte: Math.max(1, valueLength.min) || 1,
                        lte: valueLength.max || undefined,
                      },
                    },
                  },
                ].filter(Boolean),
              },
            },
          },
        }
      }),
    },
  }

  const query = {
    bool: {
      must: [
        mustBeforeDate,
        mustUserId,
        mustUserIds,
        mustQuestionnaireId,
        mustSubmissionId,
        mustSubmissionIds,
        mustHaveSomeAnswers,
        mustSearch,
        mustValue,
        mustHaveAnswers,
      ].filter(Boolean),
      must_not: [mustNotSubmissionId, mustNotSubmissionIds].filter(Boolean),
    },
  }

  if (by === 'random' && date) {
    return {
      function_score: {
        query,
        functions: [{ random_score: { seed: date, field: 'id' } }],
      },
    }
  }

  return query
}

const count = async (args, elastic) => {
  try {
    const submissionSort = createSubmissionsSort(args)
    const submissionsQuery = createSubmissionsQuery(args)

    const res = await elastic.search({
      index: utils.getIndexAlias('questionnairesubmission', 'read'),
      track_total_hits: true,
      size: 0,
      body: {
        sort: submissionSort,
        query: submissionsQuery,
      },
    })

    const total = res.hits.total
    return Number.isFinite(total?.value) ? total.value : total
  } catch (e) {
    console.warn(e.message)
  }

  return 0
}

const find = async (args, cursors, elastic) => {
  try {
    const submissionsFrom = createSubmissionsFrom(args, cursors)
    const submissionsSize = createSubmissionsSize(args, cursors)
    const submissionSort = createSubmissionsSort(args, cursors)
    const submissionsQuery = createSubmissionsQuery(args, cursors)

    const res = await elastic.search({
      index: utils.getIndexAlias('questionnairesubmission', 'read'),
      _source: { excludes: ['resolved.*'] },
      from: submissionsFrom,
      size: submissionsSize,
      body: {
        sort: submissionSort,
        query: submissionsQuery,
      },
    })

    const hits = res.hits.hits

    return hits.map(({ _source, inner_hits }) => {
      const matchedAnswers = inner_hits?.['resolved.answers']?.hits?.hits

      return {
        ..._source,
        _matchedAnswerIds: matchedAnswers?.map((hit) => hit._source.id),
      }
    })
  } catch (e) {
    console.warn(e.message)
  }

  return []
}

const getConnection = (anchors, args, context) => {
  const { userId, questionnaireId, isMember } = anchors
  const { elastic } = context

  const sortStarter = { date: new Date().toISOString() }

  const countFn = (args) => {
    const { after, before } = args

    const search = after?.search || before?.search || args.search || undefined
    const value = after?.value || before?.value || args.value || undefined
    const filters = after?.filters || before?.filters || args.filters || {}
    const sort = after?.sort ||
      before?.sort || { ...args?.sort, ...sortStarter }

    return count(
      { userId, questionnaireId, isMember, search, value, filters, sort },
      elastic,
    )
  }

  const nodesFn = (args) => {
    const { after, before } = args

    const size = Math.min(
      Math.abs(
        [after?.first, before?.first, args.first, 10].find(Number.isFinite),
      ),
      100,
    )

    const search = after?.search || before?.search || args.search || undefined
    const value = after?.value || before?.value || args.value || undefined
    const filters = after?.filters || before?.filters || args.filters || {}
    const sort = after?.sort ||
      before?.sort || { ...args?.sort, ...sortStarter }

    return find(
      { size, userId, questionnaireId, isMember, search, value, filters, sort },
      { after, before },
      elastic,
    )
  }

  const pageInfoFn = (args, payload) => {
    const { after, before } = args
    const { nodes } = payload

    const first = Math.min(
      Math.abs(
        [after?.first, before?.first, args.first, 10].find(Number.isFinite),
      ),
      100,
    )

    const search = after?.search || before?.search || args?.search || undefined
    const value = after?.value || before?.value || args?.value || undefined
    const filters = after?.filters || before?.filters || args?.filters || {}
    const sort = after?.sort ||
      before?.sort || { ...args?.sort, ...sortStarter }
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
      end: { first, count, search, value, filters, sort },
      hasPreviousPage: count > first,
      start: { first, count, search, value, filters, sort },
    }
  }

  return pageini(args, countFn, nodesFn, pageInfoFn)
}

const getSubmissionById = async (anchors, args, context) => {
  const { questionnaireId } = anchors
  const { loaders } = context
  const { after, before } = args

  const size = Math.min(
    Math.abs(
      [after?.first, before?.first, args.first, 10].find(Number.isFinite),
    ),
    100,
  )

  const search = after?.search || before?.search || args.search || undefined
  const value = after?.value || before?.value || args.value || undefined
  const filters = after?.filters || before?.filters || args.filters || {}
  // sort is irrelevant
  const unwantedFilters = Object.keys(filters).filter((key) => key !== 'id')

  if (size < 1 || !!search || !!value || unwantedFilters?.length) {
    return false
  }

  const submissionId = filters?.id
  if (!submissionId) {
    return false
  }

  const submission = await loaders.QuestionnaireSubmissions.byKeyObj.load({
    questionnaireId,
    id: submissionId,
  })
  if (!submission) {
    return false
  }

  return {
    pageInfo: {
      endCursor: null,
      startCursor: null,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    totalCount: 1,
    nodes: [submission],
  }
}

module.exports = {
  count,
  find,
  getConnection,
  getSubmissionById,
}
