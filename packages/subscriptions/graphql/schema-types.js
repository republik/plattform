module.exports = `

extend type User {
  # subject: this.user
  # object: union
  subscribedTo(
    first: Int
    last: Int
    before: String
    after: String
  ): SubscriptionConnection!

  # subject: user
  # object: this.user
  subscribedBy(
    first: Int
    last: Int
    before: String
    after: String
  ): SubscriptionConnection!

  # subject: me
  # object: this.user
  subscribedByMe: Subscription
}

extend type Discussion {
  userSubscriptionsForCommenters(
    first: Int
    last: Int
    before: String
    after: String
  ): SubscriptionConnection!
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
  totalCount: Int
  # private
  pageInfo: SubscriptionPageInfo
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
