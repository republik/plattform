module.exports = `

schema {
  query: queries
}

type queries {
  faqs(locale: Locale!): [Faq!]!
  events: [Event!]!
  updates: [Update!]!
  employees(
    "shuffle and limit the result to the specified count"
    shuffle: Int
    "boost one famous female and one famous male employee"
    withBoosted: Boolean
    "return employees with an onboarding greeting"
    withGreeting: Boolean
    "return employees with a brief pitch"
    withPitch: Boolean
    "filter for promoted authors"
    onlyPromotedAuthors: Boolean
  ): [Employee!]!
  mediaResponses: [MediaResponse!]!
}
`
