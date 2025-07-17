export = `
type ArticleContributor {
  id: ID!
  name: String!
  slug: String!
  shortBio: String
  bio: String
  image: String
  prolitterisId: String
  prolitterisFirstname: String
  prolitterisLastname: String
  gender: GenderEnum
  userId: ID
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum GenderEnum {
  m
  f
  d
  na
}

type ContributorMutationError {
  field: String
  message: String!
}

type UpsertContributorResult {
  contributor: ArticleContributor
  isNew: Boolean!
  warnings: [String!]!
  errors: [UpsertContributorError!]!
}

type DeleteContributorResult {
  success: Boolean!
  errors: [DeleteContributorError!]!
}

type ContributorConnection {
  totalCount: Int!
  pageInfo: ContributorPageInfo!
  nodes: [ArticleContributor!]!
}

type ContributorPageInfo {
  hasNextPage: Boolean!
  endCursor: String
  hasPreviousPage: Boolean!
  startCursor: String
}

input ContributorFilters {
  gender: GenderEnum
  hasProlitterisId: Boolean
  hasUserId: Boolean
  search: String
}

input ContributorOrderBy {
  field: ContributorOrderField!
  direction: OrderDirection!
}

enum ContributorOrderField {
  name
  createdAt
  updatedAt
}

enum OrderDirection {
  ASC
  DESC
}
`
