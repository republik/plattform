const debug = require('debug')('votings:lib:queries')

const tableMapping = {
  votings: {
    name: 'votings',
    foreignKey: 'votingId',
    ballotsTable: 'ballots',
    allowedMembershipsTable: 'votingMembershipRequirements'
  },
  elections: {
    name: 'elections',
    foreignKey: 'electionId',
    ballotsTable: 'electionBallots',
    allowedMembershipsTable: 'electionMembershipRequirements'
  }
}

const buildQueries = (tableName) => {
  const table = tableMapping[tableName]
  if (!table) {
    throw new Error(`tableMapping for table name "${table}" not found`)
  }

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
    const query = findQuery(`
      WHERE
        e.slug = :slug
    `)
    console.log({query})
    const result = await pgdb.query(findQuery(`
      WHERE
        e.slug = :slug
    `), {
      slug
    })
    console.log('findBySlug', slug, result[0])
    return result && result[0]
  }

  const userSubmitDate = async (id, userId, pgdb) => {
    if (!userId) {
      return false
    }
    const ballot = await pgdb.public[table.ballotsTable].findFirst({
      userId: userId,
      [table.foreignKey]: id
    })
    if (!ballot) {
      return
    }
    return ballot.updatedAt
  }
  const userHasSubmitted = async (id, userId, pgdb) => {
    if (!userId) {
      return false
    }
    return !!(await userSubmitDate(id, userId, pgdb))
  }

  const numSubmitted = async (id, pgdb) => {
    return pgdb.public[table.ballotsTable].count({ [table.foreignKey]: id })
  }

  const countEligibles = async (entity, userId, pgdb) => {
    const allowedRoles = entity.allowedRoles && entity.allowedRoles.length > 0
    const allowedMemberships = entity.allowedMemberships && entity.allowedMemberships.length > 0

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

    const query = `
      SELECT
        COUNT(DISTINCT(u.id))
      FROM
        users u
      LEFT JOIN
        memberships m
        ON u.id = m."userId"
      ${allowedRoles || allowedMemberships || userId ? 'WHERE' : ''}
      ${allowedRoles ? 'u.roles ?| :roles' : ''}
      ${allowedRoles && allowedMemberships ? 'AND' : ''}
      ${allowedMembershipsQuery ? '(' + allowedMembershipsQuery + ')' : ''}
      ${(allowedRoles || allowedMemberships) && userId ? 'AND' : ''}
      ${userId ? 'u.id = :userId' : ''}
    `

    debug('countEligibles', query, options, {entity, userId})
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

  return {
    findQuery,
    find,
    findById,
    findBySlug,
    userSubmitDate,
    userHasSubmitted,
    numSubmitted,
    numEligible,
    isEligible,
    turnout
  }
}

module.exports = {
  buildQueries
}
