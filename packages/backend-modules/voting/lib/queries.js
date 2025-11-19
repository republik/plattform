const debug = require('debug')('votings:lib:queries')
const pick = require('lodash/pick')
const isEqual = require('lodash/isEqual')

// Performance optimization: Cache for turnout calculations
// to avoid expensive full table scans on every request
const turnoutCache = new Map()
const TURNOUT_CACHE_TTL = 60000 // 1 minute in milliseconds

const getCachedValue = (cacheKey) => {
  const cached = turnoutCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < TURNOUT_CACHE_TTL) {
    debug('turnoutCache hit for', cacheKey)
    return cached.value
  }
  debug('turnoutCache miss for', cacheKey)
  return null
}

const setCachedValue = (cacheKey, value) => {
  turnoutCache.set(cacheKey, {
    value,
    timestamp: Date.now(),
  })
  // Cleanup old cache entries periodically
  if (turnoutCache.size > 100) {
    const now = Date.now()
    for (const [key, entry] of turnoutCache.entries()) {
      if (now - entry.timestamp > TURNOUT_CACHE_TTL) {
        turnoutCache.delete(key)
      }
    }
  }
}

const tableMapping = {
  votings: {
    name: 'votings',
    foreignKey: 'votingId',
    ballotsTable: 'ballots',
    allowedMembershipsTable: 'votingMembershipRequirements',
    translationsKey: 'voting',
    hasGroupSlug: true,
  },
  elections: {
    name: 'elections',
    foreignKey: 'electionId',
    ballotsTable: 'electionBallots',
    allowedMembershipsTable: 'electionMembershipRequirements',
    translationsKey: 'election',
    hasGroupSlug: true,
  },
  questionnaires: {
    name: 'questionnaires',
    foreignKey: 'questionnaireId',
    ballotsTable: 'questionnaireSubmissions',
    allowedMembershipsTable: 'questionnaireMembershipRequirements',
    translationsKey: 'questionnaire',
    hasGroupSlug: false,
  },
}

const buildQueries = (tableName) => {
  const table = tableMapping[tableName]
  if (!table) {
    throw new Error(`tableMapping for table name "${table}" not found`)
  }

  const insertAllowedMemberships = async (id, allowedMemberships, pgdb) => {
    return Promise.all(
      allowedMemberships.map((mr) =>
        pgdb.public[table.allowedMembershipsTable].insert({
          [table.foreignKey]: id,
          ...mr,
        }),
      ),
    )
  }

  const slugExists = async (slug, pgdb) =>
    (await pgdb.public[table.name].count({ slug })) > 0

  const findQuery = (where = '') => `
    SELECT
      e.*,
      json_agg(mr.* ORDER BY mr."createdBefore")
        FILTER (WHERE mr."${table.foreignKey}" IS NOT NULL)
        AS "allowedMemberships"
    FROM
      ${table.name} e
    LEFT JOIN
      "${table.allowedMembershipsTable}" mr
      ON e.id = mr."${table.foreignKey}"
    ${where}
    GROUP BY
      e.id
  `

  const find = async (pgdb) => pgdb.query(findQuery())

  const findById = async (id, pgdb) => {
    const result = await pgdb.query(
      findQuery(`
      WHERE
        e.id = :id
    `),
      {
        id,
      },
    )
    return result && result[0]
  }

  const findBySlug = async (slug, pgdb) => {
    const result = await pgdb.query(
      findQuery(`
      WHERE
        e.slug = :slug
    `),
      {
        slug,
      },
    )
    return result && result[0]
  }

  const findByGroupSlug = async (groupSlug, pgdb) => {
    const result = await pgdb.query(
      findQuery(`
      WHERE
        e."groupSlug" = :groupSlug
    `),
      {
        groupSlug,
      },
    )
    return result
  }

  const userSubmitDate = async (id, userId, context) => {
    const {
      pgdb,
      loaders: { QuestionnaireSubmissions },
    } = context
    if (!userId) {
      return null
    }
    let ballot
    if (table.ballotsTable === 'questionnaireSubmissions') {
      ballot = await QuestionnaireSubmissions.byKeyObj.load({
        userId,
        [table.foreignKey]: id,
      })
    } else {
      ballot = await pgdb.public[table.ballotsTable].findFirst({
        userId,
        [table.foreignKey]: id,
      })
    }
    if (!ballot) {
      return null
    }
    return ballot.updatedAt
  }
  const userHasSubmitted = async (id, userId, context) => {
    if (!userId) {
      return false
    }
    return !!(await userSubmitDate(id, userId, context))
  }
  const userSubmissionId = async (id, userId, context) => {
    const {
      loaders: { QuestionnaireSubmissions },
    } = context
    if (!userId) {
      return null
    }

    if (table.ballotsTable === 'questionnaireSubmissions') {
      const submission = await QuestionnaireSubmissions.byKeyObj.load({
        userId,
        [table.foreignKey]: id,
      })

      if (submission) {
        return submission.id
      }
    }

    return null
  }

  const numSubmitted = async (entityId, pgdb) => {
    const cacheKey = `submitted:${table.name}:${entityId}`
    const cached = getCachedValue(cacheKey)
    if (cached !== null) {
      return cached
    }

    const result = await pgdb.queryOneField(
      `
      SELECT COUNT(DISTINCT "userId")
      FROM "${table.ballotsTable}" b
      WHERE b."${table.foreignKey}" = :entityId
    `,
      { entityId },
    )

    setCachedValue(cacheKey, result)
    return result
  }

  const numSubmittedByGroup = async (groupSlug, pgdb) => {
    const cacheKey = `submittedByGroup:${table.name}:${groupSlug}`
    const cached = getCachedValue(cacheKey)
    if (cached !== null) {
      return cached
    }

    const queries = []
    const params = []

    Object.keys(tableMapping).forEach((key) => {
      const { hasGroupSlug, ballotsTable, name, foreignKey } = tableMapping[key]
      if (hasGroupSlug) {
        queries.push(`
          SELECT DISTINCT b."userId"
          FROM "${ballotsTable}" b
          JOIN "${name}" e
            ON b."${foreignKey}" = e.id
          WHERE e."groupSlug" = $${params.length + 1}
        `)
        params.push(groupSlug)
      }
    })

    if (!queries.length) {
      return 0
    }

    const submittedQuery = `
      WITH "userIds" AS (${queries.join(' UNION ')})
      SELECT COUNT("userId") FROM "userIds"
    `

    debug('numSubmittedByGroup', submittedQuery)

    const result = await pgdb.queryOneField(submittedQuery, params)
    setCachedValue(cacheKey, result)
    return result
  }

  const haveSameRestrictions = (entityA, entityB) => {
    const maxAllowedMemberships = Math.max(
      entityA.allowedMemberships ? entityA.allowedMemberships.length : 0,
      entityB.allowedMemberships ? entityB.allowedMemberships.length : 0,
    )
    const compareFields = [
      'allowEmptyBallots',
      'allowedRoles',
      ...Array(maxAllowedMemberships)
        .fill(1)
        .map((_, i) => `allowedMemberships[${i}].membershipTypeId`),
      ...Array(maxAllowedMemberships)
        .fill(1)
        .map((_, i) => `allowedMemberships[${i}].createdBefore`),
    ]
    return isEqual(pick(entityA, compareFields), pick(entityB, compareFields))
  }

  const countEligibles = async (entity, userId, pgdb) => {
    const allowedRoles = entity.allowedRoles && entity.allowedRoles.length > 0
    const allowedMemberships =
      entity.allowedMemberships && entity.allowedMemberships.length > 0

    if (!allowedRoles && !allowedMemberships && userId) {
      return 1
    }

    const options = {
      ...(allowedRoles ? { roles: entity.allowedRoles } : {}),
      ...(userId ? { userId } : {}),
    }

    const allowedMembershipsQuery =
      allowedMemberships &&
      entity.allowedMemberships
        .map((mr, index) => {
          const mti = `membershipTypeId${index}`
          const cbi = `createdBefore${index}`
          options[mti] = mr.membershipTypeId
          options[cbi] = mr.createdBefore
          return `(m."membershipTypeId" = :${mti} AND m."createdAt" < :${cbi})`
        })
        .join('\nOR\n')

    const where = [
      allowedRoles && 'u.roles ?| :roles',
      allowedMembershipsQuery &&
        `((${allowedMembershipsQuery}) AND m.active = TRUE)`,
      userId && 'u.id = :userId',
    ]
      .filter(Boolean)
      .join(' AND ')
      .trim()

    const query = `
      SELECT
        COUNT(DISTINCT(u.id))
      FROM
        users u
      LEFT JOIN
        memberships m
        ON u.id = m."userId"
      ${where && where.length && 'WHERE ' + where}
    `

    debug('countEligibles', query, options, { entity, userId })
    return pgdb.queryOneField(query, options)
  }

  const numEligible = async (entity, pgdb) => {
    const cacheKey = `eligible:${table.name}:${entity.id}`
    const cached = getCachedValue(cacheKey)
    if (cached !== null) {
      return cached
    }

    const startTime = Date.now()
    const result = await countEligibles(entity, null, pgdb)
    const duration = Date.now() - startTime
    debug(
      `numEligible for ${table.name}:${entity.id} took ${duration}ms, result: ${result}`,
    )

    setCachedValue(cacheKey, result)
    return result
  }

  const isEligible = async (userId, entity, pgdb) => {
    if (!userId || !entity) {
      return false
    }

    // Cache eligibility checks per user per entity per request
    const cacheKey = `eligible:${table.name}:${entity.id}:${userId}`
    const cached = getCachedValue(cacheKey)
    if (cached !== null) {
      return cached
    }

    const allowedRoles = entity.allowedRoles && entity.allowedRoles.length > 0
    const allowedMemberships =
      entity.allowedMemberships && entity.allowedMemberships.length > 0

    // Fast path: no restrictions means everyone is eligible
    if (!allowedRoles && !allowedMemberships) {
      setCachedValue(cacheKey, true)
      return true
    }

    const user = await pgdb.public.users.findOne({ id: userId })
    if (!user) {
      setCachedValue(cacheKey, false)
      return false
    }

    const result = (await countEligibles(entity, user.id, pgdb)) > 0
    setCachedValue(cacheKey, result)
    return result
  }

  const turnout = async (entity, pgdb) => ({
    eligible: await numEligible(entity, pgdb),
    submitted: await numSubmitted(entity.id, pgdb),
  })

  const ensureReadyToSubmit = async (
    entity,
    userId,
    now = new Date(),
    context,
  ) => {
    const { pgdb, t } = context

    if (!entity) {
      throw new Error(t(`api/${table.translationsKey}/404`))
    }
    if (entity.beginDate > now) {
      throw new Error(t(`api/${table.translationsKey}/tooEarly`))
    }
    if (entity.endDate < now) {
      throw new Error(t(`api/${table.translationsKey}/tooLate`))
    }

    if (userId) {
      const [resultIsEligible, resultUserHasSubmitted] = await Promise.all([
        isEligible(userId, entity, pgdb),
        userHasSubmitted(entity.id, userId, context),
      ])
      if (!resultIsEligible) {
        throw new Error(t(`api/${table.translationsKey}/notEligible`))
      }
      if (!entity?.resubmitAnswers && resultUserHasSubmitted) {
        throw new Error(t(`api/${table.translationsKey}/alreadySubmitted`))
      }
    } else if (!entity.unattributedAnswers) {
      throw new Error(t(`api/${table.translationsKey}/noUnattributedAnswers`))
    }
  }

  return {
    insertAllowedMemberships,
    slugExists,
    findQuery,
    find,
    findById,
    findBySlug,
    findByGroupSlug,
    userSubmitDate,
    userHasSubmitted,
    userSubmissionId,
    numSubmitted,
    numSubmittedByGroup,
    haveSameRestrictions,
    numEligible,
    isEligible,
    turnout,
    ensureReadyToSubmit,
  }
}

module.exports = {
  buildQueries,
}
