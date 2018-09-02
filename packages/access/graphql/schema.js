module.exports = `

schema {
  mutation: mutations
}

type mutations {
  """
  Grant a membership
  """
  grantAccess(
    "An ID of an existing AccessCampaign"
    campaignId: ID!,
    "Recipient of a membership should be granted to"
    email: String!
  ): AccessGrant!

  """
  Revoke a granted membership
  """
  revokeAccess(id: ID!): Boolean!
}

`
