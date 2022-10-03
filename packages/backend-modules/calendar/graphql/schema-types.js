module.exports = `

type Calendar {
  id: ID!
  slug: String!
  slots(
    from: DateTime
    to: DateTime
  ): [CalendarSlot!]
}

type CalendarSlot {
  id: ID!
  key: String!
  userCanBook: Boolean!
  userHasBooked: Boolean!
  userCanCancel: Boolean!
}

extend type User {
  calendar(slug: String!): Calendar
}

`
