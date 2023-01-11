const utils = require('@orbiting/backend-modules-search/lib/utils')
const {
  paginate: { pageini },
} = require('@orbiting/backend-modules-utils')

const findMatchingAnswerIds = async ({ search, hits }, elastic) => {
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
                  'resolved.value.ImageChoice',
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
              'resolved.answers.resolved.value.ImageChoice',
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
  const mustNotSubmissionId = filters?.not && { term: { id: filters.not } }

  const query = {
    bool: {
      must: [
        mustBeforeDate,
        mustUserId,
        mustQuestionnaireId,
        mustSearch,
        mustSubmissionId,
      ].filter(Boolean),
      must_not: [mustNotSubmissionId].filter(Boolean),
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

const find = async (args, cursors, elastic) => {
  const { search } = args

  try {
    const submissionsFrom = createSubmissionsFrom(args, cursors)
    const submissionsSize = createSubmissionsSize(args, cursors)
    const submissionSort = createSubmissionsSort(args, cursors)
    const submissionsQuery = createSubmissionsQuery(args, cursors)

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

    const hits = submissionsBody.hits.hits

    const _matchedAnswerIds = await findMatchingAnswerIds(
      { search, hits },
      elastic,
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

  const sortStarter = { date: new Date().toISOString() }

  const countFn = (args) => {
    const { after, before } = args

    const search = after?.search || before?.search || args.search || undefined
    const filters = after?.filters || before?.filters || args.filters || {}
    const sort = after?.sort ||
      before?.sort || { ...args?.sort, ...sortStarter }

    return count(
      { userId, questionnaireId, isMember, search, filters, sort },
      elastic,
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
    const sort = after?.sort ||
      before?.sort || { ...args?.sort, ...sortStarter }

    return find(
      { size, userId, questionnaireId, isMember, search, filters, sort },
      { after, before },
      elastic,
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
      end: { first, count, search, filters, sort },
      hasPreviousPage: count > first,
      start: { first, count, search, filters, sort },
    }
  }

  return pageini(args, countFn, nodesFn, pageInfoFn)
}

module.exports = {
  count,
  find,
  getConnection,
}
