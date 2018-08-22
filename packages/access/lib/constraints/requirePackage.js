const debug = require('debug')('access:lib:constraints:requirePackage')

const hasValidMembership = async ({ grantee, settings }, { pgdb }) => {
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
      memberships."userId" = '${grantee.id}'
      AND packages.name IN (${packages})
      AND "beginDate" <= NOW()
      AND "endDate" > NOW()
  `)

  return activeMemberships.length > 0
}

const isGrantable = async (args, context) => {
  const { grantee, settings } = args
  const { pgdb } = context

  const isGrantable = await hasValidMembership({ grantee, settings }, { pgdb })

  debug(
    'isGrantable',
    {
      grantee: grantee.id,
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

  debug('getMeta', args.campaign.name, meta)

  return meta
}

module.exports = {
  isGrantable,
  getMeta
}
