module.exports = `

extend type User {
  # subject: this.user
  # object: union
  subscribedTo: SubscriptionConnection!

  # subject: user
  # object: this.user
  subscribedBy: SubscriptionConnection!


  # subject: this.user
  # object: me
  subscribedToMe: Subscription

  # subject: me
  # object: this.user
  subscribedByMe: Subscription
}

enum SubscriptionEvent {
  COMMENTS
  DOCUMENTS
}

enum SubscriptionObjectType {
  User
  #Document
  #Discussion
}
union SubscriptionObject = Document | User | Discussion

type Subscription {
  id: ID!
  object: SubscriptionObject!
  subject: User!
  filters: [SubscriptionEvent!]
  createdAt: DateTime!
  updatedAt: DateTime!
}

type SubscriptionConnection {
  totalCount: Int!
  # private
  pageInfo: SubscriptionPageInfo!
  # private
  nodes: [Subscription!]!
}

type SubscriptionPageInfo {
  hasNextPage: Boolean!
  endCursor: String
  hasPreviousPage: Boolean!
  startCursor: String
}


`
