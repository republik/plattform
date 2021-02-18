/* 
For country details (including lat/long) see:
  https://github.com/orbiting/crowdfunding-backend/blob/master/assets/geography/countries/getCountries.js 

For details based on CH postal codes see:
  https://github.com/orbiting/crowdfunding-backend/blob/master/assets/geography/chPostalCodes/convert.js


Objectives:
  - normalize country names as good as possible => enhance with details
  - normalize CH postal codes as good as possible (makes it easier to just use pc in CH) => enhance with details
  - not here but in general nice to have: save iso standard codes of countries in db table and assign each address with iso code
    see: https://datahub.io/core/country-codes#javascript
*/

module.exports = (_, args, context) => {
  const { pgdb } = context

  return pgdb.query(`
    SELECT
      lower(trim(a.country)) as country,
      trim(a."postalCode") as "postalCode",
      count(distinct u.id) AS count
    FROM memberships m
    JOIN users u
      ON m."userId" = u.id
    LEFT JOIN addresses a
      ON u."addressId" = a.id
    WHERE m.active = true
    GROUP BY a."postalCode", a.country
    ORDER BY count DESC
  `)
}
