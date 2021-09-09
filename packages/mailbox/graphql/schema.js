module.exports = `

schema {
  query: queries
}

type queries {
  mailbox(
    first: Int
    last: Int
    before: String
    after: String
    filters: MailboxFiltersInput
  ): MailboxConnection
}

`
