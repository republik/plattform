const maxmind = require('maxmind')
const path = require('path')

const FILE_MISSING = Symbol('GeoLite2-City.mmdb missing')

let lookup

const init = async () => {
  const relativeFilepath = '../../../../local/geo/GeoLite2-City.mmdb'
  const filepath = path.resolve(__dirname, relativeFilepath)

  return maxmind.open(filepath).catch((e) => {
    console.warn("WARNING: GeoLite2-City.mmdb missing. Resolve IP won't work.")
    return FILE_MISSING
  })
}

module.exports = async (ip) => {
  if (!lookup) {
    lookup = await init()
  }

  if (lookup === FILE_MISSING) {
    return { country: null, countryEN: null, city: null }
  }

  const res = lookup.get(ip)

  return {
    country: res?.country?.names?.de,
    countryEN: res?.country?.names?.en,
    city: res?.city?.names?.de,
  }
}
