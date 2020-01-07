module.exports = `

type MailLogConnection {
  totalCount: Int!
  pageInfo: MailLogPageInfo!
  nodes: [MailLogRecord!]!
}

type MailLogPageInfo {
  hasNextPage: Boolean!
  endCursor: String
  hasPreviousPage: Boolean!
  startCursor: String
}

type MailLogRecord {
  id: ID!
  type: String
  template: String
  email: String
  subject: String
  status: String
  error: String
  mandrill: [MailLogLink!]
  user: User
  createdAt: DateTime!
  updatedAt: DateTime!
}

type MailLogLink {
  label: String!
  url: String!
}

extend type User {
  mailLog(
    first: Int
    last: Int
    before: String
    after: String
  ): MailLogConnection
}

`
