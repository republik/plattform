module.exports = `
schema {
  mutation: mutations
}

type mutations {
  upsertDevice(token: ID!, information: DeviceInformationInput!): Device!

  rollDeviceToken(oldToken: String, newToken: String!): Device! @deprecated(reason: "not used in app anymore. Will be evicted if no API calls are tracked anymore.")

  # users can remove their devices
  removeDevice(id: ID!): Boolean!
}
`
