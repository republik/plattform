module.exports = (_, args, context) => {
  const { pgdb } = context

  /* TODO: There is one pledge with type PROLONG - why? */

  return pgdb.query(`
    SELECT
      date_trunc('year', m."createdAt") as year,
      pak.name as "aboType",
      CASE 
        WHEN p.donation = 0 THEN 'normal'
        WHEN p.donation < 0 THEN 'reduced'
        WHEN p.donation > 0 THEN 'donated'
      END "aboPrice",
    count(p.id) as count    
    FROM pledges p
    JOIN
      memberships m
      ON p.id = m."pledgeId"
    JOIN packages pak
      ON pak.id = p."packageId"

    WHERE m.active = true
    GROUP BY 1, 2, 3
    ORDER BY 1 
  `)
}
