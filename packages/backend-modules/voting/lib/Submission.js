const {
  paginate: { pageini },
} = require('@orbiting/backend-modules-utils')

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const onlyUuids = (ids = []) => ids.filter((id) => UUID_RE.test(id))

// Answers belonging to submission "s", the way a submission and its answers
// are linked: via userId, via pseudonym, or both.
const ANSWER_OF_SUBMISSION = `
  a."questionnaireId" = s."questionnaireId"
  AND a.submitted
  AND (s."userId" IS NOT NULL OR s.pseudonym IS NOT NULL)
  AND (s."userId" IS NULL OR a."userId" = s."userId")
  AND (s.pseudonym IS NULL OR a.pseudonym = s.pseudonym)
`

const answersOfSubmission = (condition = 'TRUE') => `
  SELECT 1
  FROM answers a
  JOIN questions q ON q.id = a."questionId"
  WHERE ${ANSWER_OF_SUBMISSION} AND (${condition})
`

// Human readable value of an answer, Choice and ImageChoice resolved to
// their option labels.
const ANSWER_VALUE_TEXT = `
  CASE
    WHEN q.type = 'Text' THEN a.payload->>'value'
    WHEN q.type IN ('Choice', 'ImageChoice')
      AND jsonb_typeof(a.payload->'value') = 'array' THEN (
        SELECT string_agg(
          COALESCE(
            (
              SELECT opt->>'label'
              FROM jsonb_array_elements(q."typePayload"->'options') opt
              WHERE opt->>'value' = v
              LIMIT 1
            ),
            v
          ),
          ' '
        )
        FROM jsonb_array_elements_text(a.payload->'value') v
      )
  END
`

const createSubmissionsFrom = (_, { after, before } = {}) =>
  Math.max(0, parseInt(after?.count || before?.count, 10) || 0)

const createSubmissionsSize = ({ size }) => size

const createSubmissionsOrderBy = ({ sort }) => {
  if (sort?.by === 'random' && sort?.date) {
    return 'md5(s.id::text || :seed), s.id'
  }

  const direction = sort?.direction === 'ASC' ? 'ASC' : 'DESC'

  return `s."createdAt" ${direction}, s.id`
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
  const params = {}
  const conditions = []
  let matchedAnswers

  if (sort?.date) {
    conditions.push('s."createdAt" <= :beforeDate')
    params.beforeDate = sort.date
  }
  if (sort?.by === 'random' && sort?.date) {
    params.seed = sort.date
  }

  if (userId) {
    conditions.push('s."userId" = :userId')
    params.userId = userId
  }
  if (filters?.userIds) {
    conditions.push('s."userId" = ANY(:userIds::uuid[])')
    params.userIds = onlyUuids(filters.userIds)
  }
  if (questionnaireId) {
    conditions.push('s."questionnaireId" = :questionnaireId')
    params.questionnaireId = questionnaireId
  }

  if (filters?.id) {
    conditions.push(UUID_RE.test(filters.id) ? 's.id = :id' : 'FALSE')
    params.id = filters.id
  }
  if (filters?.submissionIds?.length) {
    conditions.push('s.id = ANY(:submissionIds::uuid[])')
    params.submissionIds = onlyUuids(filters.submissionIds)
  }
  if (filters?.not && UUID_RE.test(filters.not)) {
    conditions.push('s.id <> :not')
    params.not = filters.not
  }
  if (filters?.notSubmissionIds?.length) {
    conditions.push('s.id <> ALL(:notSubmissionIds::uuid[])')
    params.notSubmissionIds = onlyUuids(filters.notSubmissionIds)
  }

  // Skip submissions without any (visible) answer
  conditions.push(`EXISTS (${answersOfSubmission()})`)

  const matchedConditions = []

  if (search) {
    params.search = search

    const answerMatches = `to_tsvector(
      'german',
      concat_ws(' ', q.text, ${ANSWER_VALUE_TEXT})
    ) @@ websearch_to_tsquery('german', :search)`

    const userMatches = `${isMember ? 'TRUE' : 'u."hasPublicProfile"'} AND
      to_tsvector(
        'german',
        concat_ws(' ', u."firstName", u."lastName")
      ) @@ websearch_to_tsquery('german', :search)`

    conditions.push(`(
      EXISTS (${answersOfSubmission(answerMatches)})
      OR EXISTS (
        SELECT 1 FROM users u WHERE u.id = s."userId" AND ${userMatches}
      )
    )`)
    matchedConditions.push(answerMatches)
  }

  if (value) {
    params.value = value

    // Value is either a scalar or a list of scalars
    const valueMatches = `CASE
      WHEN jsonb_typeof(a.payload->'value') = 'array' THEN EXISTS (
        SELECT 1
        FROM jsonb_array_elements_text(a.payload->'value') v
        WHERE v = :value
      )
      ELSE a.payload->>'value' = :value
    END`

    conditions.push(`EXISTS (${answersOfSubmission(valueMatches)})`)
    matchedConditions.push(valueMatches)
  }

  if (matchedConditions.length) {
    matchedAnswers = `ARRAY(
      SELECT a.id
      FROM answers a
      JOIN questions q ON q.id = a."questionId"
      WHERE ${ANSWER_OF_SUBMISSION}
        AND (${matchedConditions.join(' OR ')})
    )`
  }

  const expectedAnswers = (filters?.answeredQuestionIds || [])
    .map((questionId) => ({ questionId }))
    .concat(filters?.answers || [])

  expectedAnswers.forEach(({ questionId, valueLength }, index) => {
    if (!UUID_RE.test(questionId)) {
      conditions.push('FALSE')
      return
    }

    params[`questionId${index}`] = questionId
    const questionMatches = [`a."questionId" = :questionId${index}`]

    if (valueLength) {
      params[`minLength${index}`] = Math.max(1, valueLength.min) || 1
      questionMatches.push(
        `q.type = 'Text'`,
        `char_length(a.payload->>'value') >= :minLength${index}`,
      )

      if (valueLength.max) {
        params[`maxLength${index}`] = valueLength.max
        questionMatches.push(
          `char_length(a.payload->>'value') <= :maxLength${index}`,
        )
      }
    }

    conditions.push(
      `EXISTS (${answersOfSubmission(questionMatches.join(' AND '))})`,
    )
  })

  return { where: conditions.join(' AND '), params, matchedAnswers }
}

const count = async (args, pgdb) => {
  try {
    const { where, params } = createSubmissionsQuery(args)

    return await pgdb.queryOneField(
      `SELECT COUNT(*) FROM "questionnaireSubmissions" s WHERE ${where}`,
      params,
    )
  } catch (e) {
    console.warn(e.message)
  }

  return 0
}

const find = async (args, cursors, pgdb) => {
  try {
    const { where, params, matchedAnswers } = createSubmissionsQuery(args)

    return await pgdb.query(
      `
      SELECT
        s.*
        ${matchedAnswers ? `, ${matchedAnswers} AS "_matchedAnswerIds"` : ''}
      FROM "questionnaireSubmissions" s
      WHERE ${where}
      ORDER BY ${createSubmissionsOrderBy(args)}
      LIMIT :size
      OFFSET :from
    `,
      {
        ...params,
        size: createSubmissionsSize(args),
        from: createSubmissionsFrom(args, cursors),
      },
    )
  } catch (e) {
    console.warn(e.message)
  }

  return []
}

const getConnection = (anchors, args, context) => {
  const { userId, questionnaireId, isMember } = anchors
  const { pgdb } = context

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
      pgdb,
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
      pgdb,
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
