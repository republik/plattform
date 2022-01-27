module.exports = `

enum OSType {
  ios,
  android
}

input DeviceInformationInput {
  appVersion: String!,
  os: OSType!,
  osVersion: StringOrNumber!
  model: String!
  userAgent: String
}

type DeviceInformation {
  appVersion: String!,
  os: OSType!,
  osVersion: String!,
  model: String!
}

type Device {
  id: ID!
  user: User!
  information: DeviceInformation!
  lastSeen: DateTime!
  createdAt: DateTime!
}

extend type User {
  devices: [Device!]!
}

extend type Session {
  device: Device
}

`
