module.exports = `

schema {
  query: queries
}

type queries {
  mailLog(
    first: Int
    last: Int
    before: String
    after: String
  ): MailLogConnection
}

`
