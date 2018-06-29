module.exports = `

enum OSType {
  iOS,
  android
}

input DeviceInformation {
  appVersion: String!,
  os: OSType!,
  osVersion: String!,
  model: String!
}

type Device {
  id: ID!
  user: User!
  description: String!
  lastSeen: DateTime!
  createdAt: DateTime!
}

extend type User {
  devices: [Device!]!
}

`
