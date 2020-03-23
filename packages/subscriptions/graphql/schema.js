module.exports = `

schema {
  query: queries
  mutation: mutations
  subscription: subscriptions
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

  markNotificationAsRead(id: ID!): Notification!
  markAllNotificationsAsRead: [Notification!]!
}

type subscriptions {
  webNotification: WebNotification!
  notification: Notification!
}
`
