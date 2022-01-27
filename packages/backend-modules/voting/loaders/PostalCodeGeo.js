const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = (context) => ({
  byAddressId: createDataLoader(
    (addressIds) =>
      context.pgdb.query(
        `
      SELECT 
        a.id "addressId",
        c.code, 
        pc.lat, 
        pc.lon
      FROM "statisticsGeoCountry" c
      JOIN "statisticsGeoPostalCode" pc
        ON c."code" = pc."countryCode"
      JOIN addresses a
        ON c."name" = a."country" AND pc."postalCode" = a."postalCode"
      WHERE 
        ARRAY[a."id"] && :addressIds
    `,
        { addressIds },
      ),
    null,
    (key, rows) => rows.find((row) => row.addressId === key),
  ),
})
