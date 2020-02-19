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

extend type Document {
  # subject: user
  # object: this.document
  subscribedBy(
    first: Int
    last: Int
    before: String
    after: String
  ): SubscriptionConnection!

  # subject: me
  # object: this.document
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

enum EventObjectType {
  Comment
  Document
}
union EventObject = Comment | Document

enum SubscriptionObjectType {
  User
  Document
  #Discussion
}
union SubscriptionObject = Document | User | Discussion

type Subscription {
  id: ID!
  object: SubscriptionObject!
  subject: User!
  filters: [EventObjectType!]
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

type NotificationConnection {
  totalCount: Int!
  pageInfo: SubscriptionPageInfo!
  nodes: [Notification!]!
}

type Notification {
  id: ID!
  object: EventObject!
  subscription: Subscription
  content: NotificationContent!
  channels: [DiscussionNotificationChannel]!
  mailLogRecord: MailLogRecord
  readAt: DateTime
  createdAt: DateTime!
}

type NotificationContent {
  title: String!
  body: String!
  url: String!
  icon: String
}


`
