module.exports = {
  async packages (crowdfunding, args, {pgdb}) {
    return pgdb.public.packages.find({crowdfundingId: crowdfunding.id})
  },
  async goals (crowdfunding, args, {pgdb}) {
    return pgdb.public.crowdfundingGoals.find({crowdfundingId: crowdfunding.id}, {
      orderBy: ['people asc', 'money asc']
    })
  },
  async status (crowdfunding, {forceUpdate}, {pgdb}) {
    if (!forceUpdate && crowdfunding.result && crowdfunding.result.status) {
      return crowdfunding.result.status
    }
    const money = await pgdb.public.queryOneField(`
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
    }) || 0
    const people = await pgdb.public.queryOneField(`
      SELECT
        COUNT(m.id)
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
    }) || 0
    return {money, people}
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
