export = `
schema {
  query: queries
  mutation: mutations
}

type queries {
  contributor(id: ID!): Contributor
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
    name: String!
    shortBio: String
    image: String
    prolitterisId: String
    prolitterisName: String
    gender: GenderEnum
    userId: ID
    employee: EmployeeStatusEnum
  ): UpsertContributorResult!
  
  deleteContributor(id: ID!): Boolean!
}
`
