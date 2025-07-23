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

union UpsertContributorResponse = UpsertContributorSuccess | UpsertContributorError

type FieldError {
  field: String
  message: String!
}

type UpsertContributorError {
  errors: [FieldError!]!
  warnings: [FieldError!]
}

type UpsertContributorSuccess {
  contributor: ArticleContributor!
  isNew: Boolean!
  warnings: [FieldError!]
}

union DeleteContributorResponse = DeleteContributorSuccess | DeleteContributorError

type DeleteContributorSuccess {
  success: Boolean
}

type DeleteContributorError {
  message: String!
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
