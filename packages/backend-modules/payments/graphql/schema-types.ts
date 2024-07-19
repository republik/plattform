export = `

extend type User {
  stripeCustomer(company: Company): StripeCustomer
}


# enum MagazineSubscriptionStatus {
#   TRAILING
#   ACTIVE
#   CANCELD
#   OVERDUE
# }
#
# enum MagazineSubscriptionType {
#   YEARLY_SUBSCRIPTION
#   MONTHLY_SUBSCRIPTION
# }
#
enum Company {
  PROJECT_R
  REPUBLIK_AG
}
#
type StripeCustomer {
  customerId: String!
  company: Company!
}
#
# type MagazineSubscription {
#   id: ID!
#   company: Company!
#   hrId: String!
#   type: MagazineSubscriptionType!
#   status: MagazineSubscriptionStatus!
#   invocies: [Invocies!]!
#   currentPeriodStart: Date
#   currentPeriodEnd: Date
#   endedAt: Date
#   cancelAt: Date
#   canceledAt: Date
#   createdAt: Date!
#   updatedAt: Date!
# }
#
# type Invoice {
#   id: ID!
# }
`
