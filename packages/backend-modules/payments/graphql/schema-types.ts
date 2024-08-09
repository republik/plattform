export = `

extend type User {
  stripeCustomer(company: Company): StripeCustomer
  magazineSubscriptions: [MagazineSubscription!]!
  activeMagazineSubscription: MagazineSubscription
}


enum MagazineSubscriptionStatus {
  trailing
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

enum Company {
  PROJECT_R
  REPUBLIK_AG
}

type StripeCustomer {
  customerId: String!
  company: Company!
}

type MagazineSubscription {
  id: ID!
  company: Company!
  type: MagazineSubscriptionType!
  status: MagazineSubscriptionStatus!
  stripeId: String! # Only Supporter Admin
  invoices: [Invoice!]!
  currentPeriodStart: Date
  currentPeriodEnd: Date
  endedAt: Date
  cancelAt: Date
  canceledAt: Date
  createdAt: Date!
  updatedAt: Date!
}

type Invoice {
  id: ID!
  hrId: String!
  total: Int!
  totalBeforeDiscount: Int!
  createdAt: Date!
  items: JSON!
}
`
