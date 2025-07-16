export = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  contributor(id: ID, slug: String): Contributor
  contributors(
    first: Int
    last: Int
    before: String
    after: String
    orderBy: ContributorOrderBy
    filters: ContributorFilters
  ): ContributorConnection!
}

type mutations {
  upsertContributor(
    id: ID
    name: String
    shortBio: String
    bio: String
    image: String
    prolitterisId: String
    prolitterisFirstname: String
    prolitterisLastname: String
    gender: GenderEnum
    userId: ID
  ): UpsertContributorResult!
  
  deleteContributor(id: ID!): DeleteContributorResult!
}
`