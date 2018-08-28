module.exports = `

extend type User {
  """
  List of memberships a User was granted
  """
  accessGrants: [AccessGrant]

  """
  List of granted memberships by User
  """
  accessCampaigns: [AccessCampaign]
}

"""
Entity describing ability and terms of granting a membership
"""
type AccessCampaign {
  id: ID!
  title: String!,
  description: String,
  grants: [AccessGrant]!
  slots: AccessCampaignSlots
}

"""
Entity representing a future, current or passed granted membership
"""
type AccessGrant {
  id: ID!
  "Campaign this membership grant belongs to"
  campaign: AccessCampaign!
  "Entity who granted membership"
  grantee: AccessGrantGrantee!
  """
  Original recipient email address of grant.
  Is eventually matched to a User (see recipient).
  """
  email: String!
  "Entity who received granted membership"
  recipient: AccessGrantRecipient
  "Beginning of sharing period"
  beginAt: DateTime!
  "Ending of sharing period"
  endAt: DateTime!
  """
  Date when grant was rendered invalid.
  """
  invalidatedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!

  isValid: Boolean!

  events: [AccessEvent]
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

# Subject to change
# Potential leak of sensitive information
type AccessGrantGrantee {
  id: String!
  name: String!
  email: String!
}

# Subject to change
# Potential leak of sensitive information
type AccessGrantRecipient {
  id: String!
  name: String!
  email: String!
}

`
