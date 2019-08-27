module.exports = `
schema {
  mutation: mutations
}

type mutations {
  upsertDevice(token: ID!, information: DeviceInformationInput!): Device!
  rollDeviceToken(oldToken: String!, newToken: String!): Device!

  # users can remove their devices
  removeDevice(id: ID!): Boolean!
}
`
