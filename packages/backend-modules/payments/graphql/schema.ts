export = `

schema {
  query: queries
  mutation: mutations
}

type queries {
  paymentsIsRunning: Boolean
}

type mutations {
  cancelMagazineSubscription(subscriptionId: String!): Boolean
}
`
