module.exports = `

schema {
  query: queries
  mutation: mutations
}

type queries {
  accessGrantInfo(id: ID!): AccessGrantInfo
}

type mutations {
  """
  Grant a membership
  """
  grantAccess(
    "An ID of an existing AccessCampaign"
    campaignId: ID!,
    "Recipient of a membership should be granted to"
    email: String
    "An optional message to the recipient"
    message: String
  ): AccessGrant!

  """
  Revoke a granted membership
  """
  revokeAccess(id: ID!): Boolean!

  """
  Invalidate access grant
  """
  invalidateAccess(id: ID!): Boolean!

  """
  Claim a granted membership with a voucher code
  """
  claimAccess(
    voucherCode: String!
    payload: JSON
  ): AccessGrant!

  """
  Request access for one-self
  """
  requestAccess(
    "An ID of an existing AccessCampaign"
    campaignId: ID!
    payload: JSON
  ): AccessGrant!
}

`
