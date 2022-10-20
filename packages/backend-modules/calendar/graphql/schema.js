module.exports = `
schema {
  mutation: mutations
}

type mutations {
  bookCalendarSlot(
    id: ID!
    userId: ID
  ): CalendarSlot!
  cancelCalendarSlot(
    id: ID!
    userId: ID
  ): CalendarSlot!
}
`
