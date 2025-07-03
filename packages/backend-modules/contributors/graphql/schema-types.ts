export = `
// Add module schema types

type Contributor {
  id: ID!
  name: String!
  slug: String!
  shortBio: String
  image: String
  prolitterisId: String
  prolitterisName: String
  gender: GenderEnum
  userId: ID
  employee: EmployeeStatusEnum
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum GenderEnum {
  m
  f
  d
}

enum EmployeeStatusEnum {
  past
  present
}

type UpsertContributorResult {
  contributor: Contributor!
  isNew: Boolean!
  warnings: [String!]!
}

type ContributorConnection {
  totalCount: Int!
  pageInfo: ContributorPageInfo!
  nodes: [Contributor!]!
}

type ContributorPageInfo {
  hasNextPage: Boolean!
  endCursor: String
  hasPreviousPage: Boolean!
  startCursor: String
}

input ContributorFilters {
  employeeStatus: EmployeeStatusEnum
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
