module.exports = `

enum EventObjectType {
  Comment
  Document
}
union EventObject = Comment | Document

enum SubscriptionObjectType {
  User
  Document
}
union SubscriptionObject = Document | User | Discussion

extend type User {
  # subject: this.user
  # object: union
  subscribedTo(
    first: Int
    last: Int
    before: String
    after: String
    objectType: SubscriptionObjectType
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
    includeParents: Boolean
    onlyEligibles: Boolean
  ): SubscriptionConnection!

  # subject: me
  # object: this.document
  # this method will return [Subscription] as soon
  # as more than formats can be subscribed
  subscribedByMe(
    includeParents: Boolean
  ): Subscription

  unreadNotifications: NotificationConnection
}

extend type Comment {
  unreadNotifications: NotificationConnection
}

extend type Discussion {
  userSubscriptionsForCommenters(
    first: Int
    last: Int
    before: String
    after: String
  ): SubscriptionConnection!
}

type Subscription {
  id: ID!
  object: SubscriptionObject
  subject: User!
  filters: [EventObjectType!]
  active: Boolean!
  isEligibleForNotifications: Boolean!
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
  unreadCount: Int!
  pageInfo: SubscriptionPageInfo!
  nodes: [Notification!]!
}

type Notification {
  id: ID!
  object: EventObject
  subscription: Subscription
  content: NotificationContent!
  channels: [DiscussionNotificationChannel]!
  mailLogRecord: MailLogRecord
  appPushesSuccessful: Int
  appPushesFailed: Int
  readAt: DateTime
  createdAt: DateTime!
}

type NotificationContent {
  title: String!
  url: String!
}

type WebNotification {
  title: String!
  body: String!
  icon: String!
  url: String!
  # see https://developer.mozilla.org/en-US/docs/Web/API/Notification/tag
  tag: String!
}


`
