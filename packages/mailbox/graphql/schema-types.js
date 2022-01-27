module.exports = `

input MailboxFiltersInput {
  hasError: Boolean
  email: String
  id: ID
}

type MailboxRecord {
  id: ID!
  type: String
  template: String
  date: DateTime!
  status: String
  error: String
  from: MailboxAddress
  to: [MailboxAddress!]
  cc: [MailboxAddress!]
  bcc: [MailboxAddress!]
  subject: String
  hasHtml: Boolean!
  html: String
  links: [MailboxLink!]
}

type MailboxAddress {
  id: ID!
  address: String!
  name: String
  user: User
}

type MailboxLink {
  id: ID!
  type: String!
  label: String!
  url: String!
}

type MailboxConnection {
  totalCount: Int!
  pageInfo: MailboxPageInfo!
  nodes: [MailboxRecord!]!
}

type MailboxPageInfo {
  hasNextPage: Boolean!
  endCursor: String
  hasPreviousPage: Boolean!
  startCursor: String
}

extend type User {
  mailbox(
    first: Int
    last: Int
    before: String
    after: String
    filters: MailboxFiltersInput
  ): MailboxConnection
}

`
