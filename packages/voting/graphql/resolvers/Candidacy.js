const { Roles, transformUser } = require('@orbiting/backend-modules-auth')

module.exports = {
  user: (candidacy, args, { user: me }) => transformUser(candidacy.user),
  yearOfBirth: (candidacy, args, { user: me }) => {
    if (!Roles.userIsInRoles(me, ['admin', 'supporter', 'associate'])) {
      return
    }

    if (!candidacy.user.birthday) {
      return
    }

    return new Date(candidacy.user.birthday).getFullYear()
  },
  city: (candidacy, args, { user: me }) => {
    if (!Roles.userIsInRoles(me, ['admin', 'supporter', 'associate'])) {
      return
    }

    if (!candidacy.user.address?.city) {
      return
    }

    return candidacy.user.address.city
  },
  postalCodeGeo: async (candidacy, args, { user: me, pgdb }) => {
    if (!Roles.userIsInRoles(me, ['admin', 'supporter', 'associate'])) {
      return
    }

    if (
      !candidacy.user.address?.postalCode &&
      !candidacy.user.address?.country
    ) {
      return
    }

    const { postalCode, country } = candidacy.user.address

    const geoResult = await pgdb.queryOne(
      `
      SELECT 
        c.code, 
        pc.lat, 
        pc.lon
      FROM "statisticsGeoCountry" c
      JOIN "statisticsGeoPostalCode" pc
      ON c."code" = pc."countryCode"
      WHERE 
        c."name" = :country AND 
        pc."postalCode" = :postalCode
    `,
      {
        country,
        postalCode,
      },
    )

    return {
      countryName: country,
      countryCode: geoResult?.code,
      postalCode,
      lat: geoResult?.lat,
      lon: geoResult?.lon,
    }
  },
  credential: (candidacy, args, { user: me, pgdb }) => {
    if (!Roles.userIsInRoles(me, ['admin', 'supporter', 'associate'])) {
      return
    }

    if (!candidacy.credentialId) {
      return
    }

    return pgdb.public.credentials.findOne({ id: candidacy.credentialId })
  },
  isIncumbent: (candidacy, args, { user: me, pgdb }) => {
    if (!Roles.userIsInRoles(me, ['admin', 'supporter', 'associate'])) {
      return
    }

    return candidacy.incumbent
  },
}
