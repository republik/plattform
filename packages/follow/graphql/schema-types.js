module.exports = `

extend type User {
  # private
  # subject: me
  # object: union
  following: FollowConnection!
  # private
  # subject: user
  # object: me
  followers: FollowConnection!
}

enum FollowEntities {
  USER_COMMENTS
  DOCUMENTS
}

union FollowObject = Document | User

type FollowRelationship {
  # subjectId-objectId-entity
  id: ID!
  entity: FollowEntities!
  object: FollowObject!
  subject: User!
}

type FollowConnection {
  totalCount: Int!
  pageInfo: FollowPageInfo!
  nodes: [FollowRelationship!]!
}

type FollowPageInfo {
  endCursor: String
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
}


`
