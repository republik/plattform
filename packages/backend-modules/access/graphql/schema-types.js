module.exports = `

extend type User {
  """
  List of memberships a User was granted
  """
  accessGrants(withPast: Boolean): [AccessGrant!]

  """
  List of granted memberships by User
  """
  accessCampaigns(withPast: Boolean): [AccessCampaign!]
}

"""
Entity describing ability and terms of granting a membership
"""
type AccessCampaign {
  id: ID!
  title: String!
  description: String
  defaultMessage: String
  grants(
    "Include grants with were revoked (admin only)"
    withRevoked: Boolean
    "Include grants with were invalidated (admin only)"
    withInvalidated: Boolean
  ): [AccessGrant!]!
  slots: AccessCampaignSlots!
  perks: AccessCampaignPerks!
  "Begin of campaign"
  beginAt: DateTime!
  "End of campaign"
  endAt: DateTime!
}

type AccessGrantInfo {
  granter: User!
  granterName: String!
  message: String
}

"""
Entity representing a future, current or passed granted membership
"""
type AccessGrant {
  id: ID!
  "Campaign this membership grant belongs to"
  campaign: AccessCampaign!
  "Entity who granted membership (Admin only)"
  granter: User
  "Name or email address of entity who granted membership"
  granterName: String!
  "Original recipient email address of grant."
  email: String
  "Voucher code claim this grant"
  voucherCode: String
  "Entity who received granted membership (Admin only)"
  recipient: User
  "Name or email address of entity who received granted access"
  recipientName: String
  "Sharing period must begin before"
  beginBefore: DateTime!
  "Beginning of sharing period"
  beginAt: DateTime
  "Ending of sharing period"
  endAt: DateTime
  """
  Date when grant was revoked
  """
  revokedAt: DateTime
  """
  Date when grant was rendered invalid
  """
  invalidatedAt: DateTime
  followupAt: DateTime
  "Status (Admin only)"
  status: String
  "Events (Admin only)"
  events: [AccessEvent]
  createdAt: DateTime!
  updatedAt: DateTime!
}

"""
Entity describing an event that occured, linked to an AccessGrant
"""
type AccessEvent {
  id: ID!
  event: String!
  createdAt: DateTime!
}

"""
Entity describing state of slots: total, used and free
"""
type AccessCampaignSlots {
  total: Int!
  free: Int!
  used: Int!
}

"""
Entity describing available perks
"""
type AccessCampaignPerks {
  giftableMemberships: Int
}
`
