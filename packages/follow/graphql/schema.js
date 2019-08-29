module.exports = `

schema {
  mutation: mutations
}

type mutations {
  follow(
    entity: FollowEntities!
    # userId, documentId
    objectId: ID!
  ): FollowRelationship!

  unfollow(
    entity: FollowEntities!
    # userId, documentId
    objectId: ID!
  ): FollowRelationship!
}
`
