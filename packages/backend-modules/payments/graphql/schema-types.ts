export = `

extend type User {
  stripeCustomer(company: CompanyName): StripeCustomer
  magazineSubscriptions: [MagazineSubscription!]!
  activeMagazineSubscription: MagazineSubscription
}


enum MagazineSubscriptionStatus {
  trialing
  active
  incomplete
  incomplete_expired
  unpaid
  past_due
  paused
  canceled
  overdue
  ended
}

enum MagazineSubscriptionType {
  YEARLY_SUBSCRIPTION
  MONTHLY_SUBSCRIPTION
}

enum CompanyName {
  PROJECT_R
  REPUBLIK
}

type StripeCustomer {
  customerId: String!
  company: CompanyName!
}

type MagazineSubscription {
  id: ID!
  company: CompanyName!
  type: MagazineSubscriptionType!
  status: MagazineSubscriptionStatus!
  stripeId: String!
  invoices: [Invoice!]!
  currentPeriodStart: DateTime
  currentPeriodEnd: DateTime
  endedAt: DateTime
  cancelAt: DateTime
  canceledAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Invoice {
  id: ID!
  hrId: String!
  total: Int!
  totalBeforeDiscount: Int!
  createdAt: DateTime!
  items: JSON!
}

type CustomerPortalSession {
  sessionUrl: String
}
`
