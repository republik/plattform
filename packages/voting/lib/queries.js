const debug = require('debug')('votings:lib:queries')
const pick = require('lodash/pick')
const isEqual = require('lodash/isEqual')

const tableMapping = {
  votings: {
    name: 'votings',
    foreignKey: 'votingId',
    ballotsTable: 'ballots',
    allowedMembershipsTable: 'votingMembershipRequirements',
    translationsKey: 'voting'
  },
  elections: {
    name: 'elections',
    foreignKey: 'electionId',
    ballotsTable: 'electionBallots',
    allowedMembershipsTable: 'electionMembershipRequirements',
    translationsKey: 'election'
  },
  questionnaires: {
    name: 'questionnaires',
    foreignKey: 'questionnaireId',
    ballotsTable: 'questionnaireSubmissions',
    allowedMembershipsTable: 'questionnaireMembershipRequirements',
    translationsKey: 'questionnaire'
  }
}

const buildQueries = (tableName) => {
  const table = tableMapping[tableName]
  if (!table) {
    throw new Error(`tableMapping for table name "${table}" not found`)
  }

  const insertAllowedMemberships = async (id, allowedMemberships, pgdb) => {
    return Promise.all(
      allowedMemberships.map(mr =>
        pgdb.public[table.allowedMembershipsTable].insert({
          [table.foreignKey]: id,
          ...mr
        })
      )
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

  const find = async (pgdb) =>
    pgdb.query(findQuery())

  const findById = async (id, pgdb) => {
    const result = await pgdb.query(findQuery(`
      WHERE
        e.id = :id
    `), {
      id
    })
    return result && result[0]
  }

  const findBySlug = async (slug, pgdb) => {
    const result = await pgdb.query(findQuery(`
      WHERE
        e.slug = :slug
    `), {
      slug
    })
    return result && result[0]
  }

  const findByGroupSlug = async (groupSlug, pgdb) => {
    const result = await pgdb.query(findQuery(`
      WHERE
        e."groupSlug" = :groupSlug
    `), {
      groupSlug
    })
    return result
  }

  const userSubmitDate = async (id, userId, context) => {
    const { pgdb, loaders: { QuestionnaireSubmissions } } = context
    if (!userId) {
      return null
    }
    let ballot
    if (table.ballotsTable === 'questionnaireSubmissions') {
      ballot = await QuestionnaireSubmissions.byKeyObj.load({
        userId,
        [table.foreignKey]: id
      })
    } else {
      ballot = await pgdb.public[table.ballotsTable].findFirst({
        userId,
        [table.foreignKey]: id
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

  const numSubmitted = async (id, pgdb) => {
    return pgdb.queryOneField(`
      SELECT
        COUNT(DISTINCT("userId"))
      FROM
        "${table.ballotsTable}" b
      WHERE
        b."${table.foreignKey}" = :entityId
    `, {
      entityId: id
    })
  }

  const numSubmittedByGroup = async (groupSlug, pgdb) => {
    return pgdb.queryOneField(`
      SELECT
        COUNT(DISTINCT(b."userId"))
      FROM
        "${table.ballotsTable}" b
      JOIN
        "${table.name}" e
        ON b."${table.foreignKey}" = e.id
      WHERE
        e."groupSlug" = :groupSlug
    `, {
      groupSlug
    })
  }

  const haveSameRestrictions = (entityA, entityB) => {
    const maxAllowedMemberships = Math.max(
      entityA.allowedMemberships ? entityA.allowedMemberships.length : 0,
      entityB.allowedMemberships ? entityB.allowedMemberships.length : 0
    )
    const compareFields = [
      'allowEmptyBallots',
      'allowedRoles',
      ...Array(maxAllowedMemberships).fill(1).map((_, i) => `allowedMemberships[${i}].membershipTypeId`),
      ...Array(maxAllowedMemberships).fill(1).map((_, i) => `allowedMemberships[${i}].createdBefore`)
    ]
    return isEqual(
      pick(entityA, compareFields),
      pick(entityB, compareFields)
    )
  }

  const countEligibles = async (entity, userId, pgdb) => {
    const allowedRoles = entity.allowedRoles && entity.allowedRoles.length > 0
    const allowedMemberships = entity.allowedMemberships && entity.allowedMemberships.length > 0

    if (!allowedRoles && !allowedMemberships && userId) {
      return 1
    }

    const options = {
      ...allowedRoles ? { roles: entity.allowedRoles } : {},
      ...userId ? { userId } : {}
    }

    const allowedMembershipsQuery = allowedMemberships && entity.allowedMemberships
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
      allowedMembershipsQuery && `(${allowedMembershipsQuery})`,
      userId && 'u.id = :userId'
    ].filter(Boolean).join(' AND ').trim()

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

  const numEligible = (entity, pgdb) => countEligibles(entity, null, pgdb)

  const isEligible = async (userId, entity, pgdb) => {
    if (!userId || !entity) {
      return false
    }

    const user = await pgdb.public.users.findOne({ id: userId })
    if (!user) {
      return false
    }

    if (await countEligibles(entity, user.id, pgdb) <= 0) {
      return false
    }

    return true
  }

  const turnout = async (entity, pgdb) => ({
    eligible: await numEligible(entity, pgdb),
    submitted: await numSubmitted(entity.id, pgdb)
  })

  const ensureReadyToSubmit = async (entity, userId, now = new Date(), context) => {
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
    if (!(await isEligible(userId, entity, pgdb))) {
      throw new Error(t(`api/${table.translationsKey}/notEligible`))
    }

    if (await userHasSubmitted(entity.id, userId, context)) {
      throw new Error(t(`api/${table.translationsKey}/alreadySubmitted`))
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
    numSubmitted,
    numSubmittedByGroup,
    haveSameRestrictions,
    numEligible,
    isEligible,
    turnout,
    ensureReadyToSubmit
  }
}

module.exports = {
  buildQueries
}
