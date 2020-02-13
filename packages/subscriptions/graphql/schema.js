module.exports = `

schema {
  query: queries
  mutation: mutations
}

type queries {
  notifications(
    first: Int
    last: Int
    before: String
    after: String
  ): NotificationConnection
}

type mutations {
  # upsert
  subscribe(
    objectId: ID!
    type: SubscriptionObjectType!
    filters: [EventObjectType!]
  ): Subscription!

  unsubscribe(
    subscriptionId: ID!
  ): Subscription!
}
`
