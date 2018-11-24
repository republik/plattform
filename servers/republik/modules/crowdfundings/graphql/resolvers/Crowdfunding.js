module.exports = {
  async packages (crowdfunding, args, {pgdb}) {
    return pgdb.public.packages.find({
      crowdfundingId: crowdfunding.id,
      custom: false
    })
  },
  async goals (crowdfunding, args, {pgdb}) {
    return pgdb.public.crowdfundingGoals.find({crowdfundingId: crowdfunding.id}, {
      orderBy: ['people asc', 'money asc']
    })
  },
  async status (crowdfunding, {forceUpdate}, {pgdb}) {
    if (!forceUpdate && crowdfunding.result && crowdfunding.result.status) {
      const { status } = crowdfunding.result
      return {
        ...status,
        memberships: status.memberships || 0
      }
    }
    const [money, memberships, people] = await Promise.all([
      // money
      pgdb.public.queryOneField(`
        SELECT
          SUM(pl.total)
        FROM
          pledges pl
        JOIN
          packages pa
          ON pl."packageId" = pa.id
        JOIN
          crowdfundings cf
          ON
            pa."crowdfundingId" = cf.id AND
            cf.id = :crowdfundingId
        WHERE
          pl.status = 'SUCCESSFUL'
      `, {
        crowdfundingId: crowdfunding.id
      }) || 0,
      // memberships
      pgdb.public.queryOneField(`
        SELECT
          COUNT(
            DISTINCT(
              m.id
            )
          )
        FROM
          memberships m
        JOIN
          pledges pl
          ON m."pledgeId" = pl.id
        JOIN
          packages pa
          ON pl."packageId" = pa.id
        JOIN
          crowdfundings cf
          ON
            pa."crowdfundingId" = cf.id AND
            cf.id = :crowdfundingId
      `, {
        crowdfundingId: crowdfunding.id
      }) || 0,
      // people
      pgdb.public.queryOneField(`
        SELECT
          COUNT(
            DISTINCT(
              u.id
            )
          )
        FROM
          pledges pl
        JOIN
          users u
          ON pl."userId" = u.id
        JOIN
          packages pa
          ON pl."packageId" = pa.id
        JOIN
          crowdfundings cf
          ON pa."crowdfundingId" = cf.id
        WHERE
          pl.status = 'SUCCESSFUL' AND
          cf.id = :crowdfundingId
      `, {
        crowdfundingId: crowdfunding.id
      }) || 0
    ])
    return {money, memberships, people}
  },
  hasEnded (crowdfunding) {
    const now = new Date()
    return now > new Date(crowdfunding.endDate)
  },
  endVideo (crowdfunding) {
    if (crowdfunding.result) {
      return crowdfunding.result.endVideo
    }
  }
}
