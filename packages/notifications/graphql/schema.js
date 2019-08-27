module.exports = `
schema {
  mutation: mutations
}

type mutations {
  upsertDevice(token: ID!, information: DeviceInformationInput!): Device!

  # deprecated: not used in app anymore, evict if no API calls tracked anymore
  rollDeviceToken(oldToken: String!, newToken: String!): Device!

  # users can remove their devices
  removeDevice(id: ID!): Boolean!
}
`
