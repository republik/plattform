module.exports = `

type CallToAction {
  id: ID!
  payload: CallToActionPayload!
  response: JSON
  beginAt: DateTime!
  endAt: DateTime!
  createdAt: DateTime!
  updatedAt: DateTime!
  """
  Timestamp when User acknowledged call to action
  """
  acknowledgedAt: DateTime
}

type CallToActionPayload {
  customComponent: CallToActionPayloadCustomComponent!
}

type CallToActionPayloadCustomComponent {
  key: String!
  args: JSON
}

extend type User {
  """
  Call to actions for a user based on events, campaigns, etc.
  Can target a specific user or a group of users.
  """
  callToActions: [CallToAction!]!
}

`
