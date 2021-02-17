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

/* Country details copied */

/* const fetch = require('isomorphic-unfetch')
const fs = require('fs')

Promise.resolve()
  .then(async () => {
    const countries = (
      await (
        await fetch(
          'http://api.geonames.org/countryInfo?type=json&username=projectr',
        )
      ).json()
    ).geonames

    let data = []

    for (let country of countries) {
      const details = (
        await (
          await fetch(
            `http://api.geonames.org/search?country=${country.countryCode}&name=${country.countryName}&maxRows=1&type=json&username=projectr`,
          )
        ).json()
      ).geonames[0] || { lat: 0, lng: 0 }

      data.push({
        code: country.countryCode,
        geonameId: country.geonameId,
        names: {
          en: country.countryName,
        },
        searchNames: [],
        languages: country.languages.split(',').map((l) => l.substring(0, 2)),
        lat: details.lat,
        lon: details.lng,
      })
    }

    fs.writeFileSync(
      `${__dirname}/countries.json`,
      JSON.stringify(data, null, 2),
      'utf8',
    )
  })
  .then(() => {
    process.exit()
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  }) */

/* Country details copied end */

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
