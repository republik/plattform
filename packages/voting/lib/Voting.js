const _ = require('lodash')
const debug = require('debug')('votings:lib:Voting')

const findQuery = (where = '') => `
  SELECT
    v.*,
    json_agg(mr.* ORDER BY mr."createdBefore")
      FILTER (WHERE mr."votingId" IS NOT NULL)
      AS "allowedMemberships"
  FROM
    votings v
  LEFT JOIN
    "votingMembershipRequirement" mr
    ON v.id = mr."votingId"
  ${where}
  GROUP BY
    v.id
`

const find = async (pgdb) =>
  pgdb.query(findQuery())

const findById = async (id, pgdb) => {
  const result = await pgdb.query(findQuery(`
    WHERE
      v.id = :id
  `), {
    id
  })
  return result && result[0]
}

const findBySlug = async (slug, pgdb) => {
  const result = await pgdb.query(findQuery(`
    WHERE
      v.slug = :slug
  `), {
    slug
  })
  return result && result[0]
}

const slugExists = async (slug, pgdb) => {
  return !!(await pgdb.public.votings.findFirst({
    slug
  }))
}

const create = async (input, pgdb) => {
  const voting = await pgdb.public.votings.insertAndGet(
    _.omit(input, ['options', 'allowedMemberships'])
  )

  if (input.options && input.options.length > 0) {
    await Promise.all(
      input.options.map(option =>
        pgdb.public.votingOptions.insert({
          votingId: voting.id,
          ...option
        })
      )
    )
  }

  if (input.allowedMemberships && input.allowedMemberships.length > 0) {
    await Promise.all(
      input.allowedMemberships.map(mr =>
        pgdb.public.votingMembershipRequirement.insert({
          votingId: voting.id,
          ...mr
        })
      )
    )
  }

  return findBySlug(input.slug, pgdb)
}

const countEligibles = async (voting, userId, pgdb) => {
  const allowedRoles = voting.allowedRoles && voting.allowedRoles.length > 0
  const allowedMemberships = voting.allowedMemberships && voting.allowedMemberships.length > 0

  const options = {
    ...allowedRoles ? { roles: voting.allowedRoles } : {},
    ...userId ? { userId } : {}
  }

  const allowedMembershipsQuery = allowedMemberships && voting.allowedMemberships
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
    ${allowedRoles || allowedMemberships ? 'WHERE' : ''}
    ${allowedRoles ? 'u.roles ?| :roles' : ''}
    ${allowedRoles && allowedMemberships ? 'AND' : ''}
    ${allowedMembershipsQuery ? '(' + allowedMembershipsQuery + ')' : ''}
    ${(allowedRoles || allowedMemberships) && userId ? 'AND' : ''}
    ${userId ? 'u.id = :userId' : ''}
  `

  debug('countEligibles', query, options, {voting, userId})
  return pgdb.queryOneField(query, options)
}

const numEligible = (voting, pgdb) => countEligibles(voting, null, pgdb)

const isEligible = async (userId, voting, pgdb) => {
  if (!userId || !voting) {
    return false
  }

  const user = await pgdb.public.users.findOne({ id: userId })
  if (!user) {
    return false
  }

  if (await countEligibles(voting, user.id, pgdb) <= 0) {
    return false
  }

  return true
}

module.exports = {
  find,
  findById,
  findBySlug,
  slugExists,
  create,
  isEligible,
  numEligible
}
