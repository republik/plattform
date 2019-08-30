module.exports = `

schema {
  mutation: mutations
}

type mutations {
  # upsert
  subscribe(
    objectId: ID!
    type: SubscriptionObjectType!
    filters: [SubscriptionEvent!]
  ): Subscription!

  unsubscribe(
    subscriptionId: ID!
  ): Subscription!
}
`
