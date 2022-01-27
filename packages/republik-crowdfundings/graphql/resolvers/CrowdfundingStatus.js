module.exports = {
  async money({ money, ignoreFreeze, crowdfunding }, args, { pgdb }) {
    if (money != undefined && !ignoreFreeze) {
      return money
    }
    return (
      pgdb.public.queryOneField(
        `
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
    `,
        {
          crowdfundingId: crowdfunding.id,
        },
      ) || 0
    )
  },
  async memberships(
    { memberships, ignoreFreeze, crowdfunding },
    args,
    { pgdb },
  ) {
    if (memberships != null && !ignoreFreeze) {
      return memberships
    }
    return (
      pgdb.public.queryOneField(
        `
    WITH pledge_ids AS (
      SELECT
        p.id as "pledgeId"
      FROM
        pledges p
      JOIN
        packages pkg
        ON p."packageId" = pkg.id
      JOIN
        crowdfundings cf
        ON
          pkg."crowdfundingId" = cf.id AND
          cf.id = :crowdfundingId
      WHERE
        p.status = 'SUCCESSFUL'
    )
      SELECT
        COUNT(
          DISTINCT(
            "membershipId"
          )
        )
        FROM
          (
              SELECT
                mp."membershipId" AS "membershipId"
              FROM
                "membershipPeriods" mp
              WHERE
                mp."pledgeId" IN (SELECT "pledgeId" FROM pledge_ids)

            UNION

              SELECT
                m."id" as "membershipId"
              FROM
                "memberships" m
              WHERE
                m."pledgeId" IN (SELECT "pledgeId" FROM pledge_ids)
          ) AS u
    `,
        {
          crowdfundingId: crowdfunding.id,
        },
      ) || 0
    )
  },
  async people({ people, ignoreFreeze, crowdfunding }, args, { pgdb }) {
    if (people != null && !ignoreFreeze) {
      return people
    }
    return (
      pgdb.public.queryOneField(
        `
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
    `,
        {
          crowdfundingId: crowdfunding.id,
        },
      ) || 0
    )
  },
}
