const debug = require('debug')('access:lib:constraints:requirePackage')

/**
 * Constraint checks if granter has an active package which resulted in a
 * membership. If not contraint will fail. Contraint will hinder display of
 * campaign.
 *
 * Story: Only users which bought a certain, stil active package can grant
 * access to others.
 *
 * @example: {"requirePackage": {"packages": ["ABO", "BENEFACTOR"]}}
 */

const hasValidMembership = async ({ granter, settings }, { pgdb }) => {
  const packages = settings.packages.map(pkg => `'${pkg}'`).join(', ')

  const activeMemberships = await pgdb.query(`
    SELECT memberships.id, packages.name
    FROM memberships

    INNER JOIN "membershipPeriods"
      ON memberships.id = "membershipPeriods"."membershipId"

    INNER JOIN pledges
      ON memberships."pledgeId" = pledges.id

    INNER JOIN packages
      ON pledges."packageId" = packages.id

    WHERE
      memberships."userId" = '${granter.id}'
      AND packages.name IN (${packages})
      AND "beginDate" <= NOW()
      AND "endDate" > NOW()
  `)

  return activeMemberships.length > 0
}

const isGrantable = async (args, context) => {
  const { granter, settings } = args
  const { pgdb } = context

  const isGrantable = await hasValidMembership({ granter, settings }, { pgdb })

  debug(
    'isGrantable',
    {
      granter: granter.id,
      settings,
      isGrantable
    }
  )

  return isGrantable
}

const getMeta = async (args, context) => {
  const isGrantableFlag = await isGrantable(args, context)

  const meta = {
    visible: isGrantableFlag,
    grantable: isGrantableFlag,
    payload: {}
  }

  return meta
}

module.exports = {
  isGrantable,
  getMeta
}
