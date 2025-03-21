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

enum CheckoutUIMode {
 HOSTED
 CUSTOM
 EMBEDDED
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
  renewsAtPrice: Int
  paymentMethod: String
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

type CheckoutSession {
  company: CompanyName!
  sessionId: String!
  clientSecret: String
  url: String
}

interface Offer {
  id: ID!
  company: CompanyName!
  name: String!
  price: Price!
  customPrice: CustomPrice
  discount: Discount
  allowPromotions: Boolean
  complimentaryItems: [ComplimentaryItem!]
}

type SubscriptionOffer implements Offer {
  id: ID!
  company: CompanyName!
  name: String!
  price: Price!
  customPrice: CustomPrice
  discount: Discount
  allowPromotions: Boolean
  complimentaryItems: [ComplimentaryItem!]
}

type GiftOffer implements Offer {
  id: ID!
  company: CompanyName!
  name: String!
  price: Price!
  customPrice: CustomPrice
  discount: Discount
  allowPromotions: Boolean
  complimentaryItems: [ComplimentaryItem!]
}

type Price {
  amount: Int!
  currency: String!
  recurring: Recurring
}

type Recurring {
  interval: String!
  interval_count: Int!
}

type CustomPrice {
  min: Int!
  max: Int!
  step: Float!
}

type Discount {
  name: String
  amountOff: Int!
  currency: String!
}

type Product {
  name: String
  defaultPrice: Price
}

type ComplimentaryItem {
  id: String!
  maxQuantity: Int!
}

type GiftVoucherValidationResult {
  type: String!
  valid: Boolean!
  isLegacyVoucher: Boolean!
}

type RedeemGiftResult {
  aboType: String!
  starting: DateTime!
}

input ComplimentaryItemOrder {
  id: String!
  quantity: Int!
}

input CheckoutSessionOptions {
  customPrice: Int
  uiMode: CheckoutUIMode
  metadata: JSON # String key value object
  returnURL: String
}

input CancelSubscriptionOptions {
  feedback: String
}

input CancelSubscription {
  subscriptionId: ID!
  options: CancelSubscriptionOptions
}
`
