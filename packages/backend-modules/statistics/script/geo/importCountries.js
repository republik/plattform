require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

console.log('running import of country information....')

PgDb.connect()
  .then(async (pgdb) => {
    const dry = process.argv[2] === '--dry'
    if (dry) {
      console.log("dry run: this won't change anything")
    }

    const countryResponse = await fetch(
      'https://raw.githubusercontent.com/orbiting/crowdfunding-backend/master/assets/geography/countries/countriesWithNames.json',
    )
    if (!countryResponse.ok) {
      throw new Error('Could not fetch JSON file.')
    }
    const countries = await countryResponse.json()

    const transaction = await pgdb.transactionBegin()

    for (const country of countries) {
      const { lat, lon, ...restOfCountry } = country
      const existingCountry =
        await transaction.public.statisticsGeoCountry.findOne({
          code: country.code,
        })

      if (existingCountry) {
        await transaction.public.statisticsGeoCountry.update(
          { code: existingCountry.code },
          {
            ...restOfCountry,
            lat: parseFloat(lat),
            lon: parseFloat(lon),
          },
        )
      } else {
        await transaction.public.statisticsGeoCountry.insert({
          ...restOfCountry,
          lat: parseFloat(lat),
          lon: parseFloat(lon),
        })
      }
    }

    if (dry) {
      console.log('rolling back...')
      await transaction.transactionRollback()
    } else {
      console.log('comitting changes...')
      await transaction.transactionCommit()
    }
  })
  .then(() => {
    process.exit()
  })
  .catch((e) => {
    console.log(e)
    process.exit(1)
  })
