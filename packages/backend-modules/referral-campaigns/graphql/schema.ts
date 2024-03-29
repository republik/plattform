export = `
schema {
  query: queries
}


type queries {
  campaign(slug: String!): Campaign
  validateReferralCode(code: String!): ReferralCodeValidationResult
}
`
