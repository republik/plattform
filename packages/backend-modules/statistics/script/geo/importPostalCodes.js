require('@orbiting/backend-modules-env').config()
const PgDb = require('@orbiting/backend-modules-base/lib/PgDb')

console.log('running import of postal code information....')

PgDb.connect()
  .then(async (pgdb) => {
    const dry = process.argv[2] === '--dry'
    if (dry) {
      console.log("dry run: this won't change anything")
    }

    const postalCodeResponse = await fetch(
      'https://raw.githubusercontent.com/orbiting/crowdfunding-backend/master/assets/geography/postalCodes/postalCodesByCountries.json',
    )

    if (!postalCodeResponse.ok) {
      throw new Error('Could not fetch JSON file.')
    }

    const postalCodesByCountry = await postalCodeResponse.json()
    const transaction = await pgdb.transactionBegin()

    for (const country of postalCodesByCountry) {
      const existingCountry =
        await transaction.public.statisticsGeoCountry.findOne({
          code: country.country,
        })
      if (existingCountry) {
        console.log(`${new Date()}: Processing ${existingCountry.name}...`)
        const postalCodes = country.postalCodes
        for (const postalCode of postalCodes) {
          const { code, lat, lon } = postalCode
          const existingPostalCode =
            await transaction.public.statisticsGeoPostalCode.findOne({
              countryCode: existingCountry.code,
              postalCode: code,
            })

          if (existingPostalCode) {
            await transaction.public.statisticsGeoPostalCode.update(
              { countryCode: existingPostalCode.countryCode, postalCode: code },
              { lat: parseFloat(lat), lon: parseFloat(lon) },
            )
          } else {
            await transaction.public.statisticsGeoPostalCode.insert({
              countryCode: existingCountry.code,
              postalCode: code,
              lat: parseFloat(lat),
              lon: parseFloat(lon),
            })
          }
        }
      } else {
        console.log(
          `Cannot add postal codes because ${country.country} does not exist in statisticsGeoCountry...`,
        )
      }
    }

    if (dry) {
      console.log('rolling back...')
      await transaction.transactionRollback()
    } else {
      console.log(`${new Date()}: comitting changes...`)
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
