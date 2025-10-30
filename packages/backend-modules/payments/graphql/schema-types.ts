export = `

extend type User {
  stripeCustomer(company: CompanyName): StripeCustomer
  magazineSubscriptions: [MagazineSubscription!]!
  activeMagazineSubscription: MagazineSubscription
  transactions: [Transaction!]!
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
}

enum MagazineSubscriptionType {
  YEARLY_SUBSCRIPTION
  MONTHLY_SUBSCRIPTION
  BENEFACTOR_SUBSCRIPTION
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

enum OfferAvailability {
  PURCHASABLE
  UPGRADEABLE
  UNAVAILABLE
  UNAVAILABLE_CURRENT
  UNAVAILABLE_UPGRADE_PENDING
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
  donation: DonationInfo
  renewsAtPrice: Int
  paymentMethod: String
  currentPeriodStart: DateTime
  currentPeriodEnd: DateTime
  endedAt: DateTime
  cancelAt: DateTime
  canceledAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!

  upgrade: MagazineSubscriptionUpgrade
}


type DonationInfo {
  amount: Int!
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
  orderId: ID!
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
  suggestedDonations: [Int!]
  discountOptions: [Discount!]
  discount: Discount
  allowPromotions: Boolean
  requiresLogin: Boolean
  requiresAddress: Boolean
  complimentaryItems: [ComplimentaryItem!]
  availability: OfferAvailability!
}

type Donation {
  id: ID!
  price: Price!
}

input CustomDonation {
  amount: Int!
  recurring: Boolean
}

type SubscriptionOffer implements Offer {
  id: ID!
  company: CompanyName!
  name: String!
  price: Price!
  customPrice: CustomPrice
  suggestedDonations: [Int!]
  discountOptions: [Discount!]
  discount: Discount
  allowPromotions: Boolean
  requiresLogin: Boolean
  requiresAddress: Boolean
  complimentaryItems: [ComplimentaryItem!]
  availability: OfferAvailability!

  # only available on subscription type
  startDate: DateTime
}

type GiftOffer implements Offer {
  id: ID!
  company: CompanyName!
  name: String!
  price: Price!
  customPrice: CustomPrice
  suggestedDonations: [Int!]
  discountOptions: [Discount!]
  discount: Discount
  allowPromotions: Boolean
  requiresLogin: Boolean
  requiresAddress: Boolean
  complimentaryItems: [ComplimentaryItem!]
  availability: OfferAvailability!
}

type Price {
  amount: Int!
  currency: String!
  recurring: Recurring
}

type Recurring {
  interval: String!
  intervalCount: Int!
}

type CustomPrice {
  min: Int!
  max: Int!
  step: Float!
}

type Discount {
  id: ID!
  name: String
  amountOff: Int!
  duration: String!,
  durationInMonths: Int
  currency: String!
  endDate: DateTime
}

type Product {
  name: String
  defaultPrice: Price
}

type ComplimentaryItem {
  id: ID!
  maxQuantity: Int!
}

type GiftVoucherValidationResult {
  type: String
  valid: Boolean!
  company: CompanyName
  isLegacyVoucher: Boolean!
}

type RedeemGiftResult {
  aboType: String!
  starting: DateTime!
}

interface Transaction {
  id: ID!
  amount: Int!
  currency: String!
  company: CompanyName!
  status: String!
  createdAt: DateTime!
}

type SubscriptionTransaction implements Transaction {
  id: ID!
  amount: Int!
  currency: String!
  company: CompanyName!
  status: String!
  createdAt: DateTime!
  subscription: MagazineSubscription!
}

type PledgeTransaction implements Transaction {
  id: ID!
  amount: Int!
  currency: String!
  company: CompanyName!
  status: String!
  createdAt: DateTime!
  pledge: Pledge!
}

type GiftTransaction implements Transaction {
  id: ID!
  amount: Int!
  currency: String!
  company: CompanyName!
  status: String!
  createdAt: DateTime!
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

type MagazineSubscriptionUpgrade {
  id: String!
  userId: String!
  subscriptionType: MagazineSubscriptionType
  subscriptionId: String!
  status: String!
  scheduledStart: DateTime!
  createdAt: DateTime!
  updatedAt: DateTime!
  billingDetails: MagazineSubscriptionUpgradeBillingDetails!
}

type MagazineSubscriptionUpgradeBillingDetails {
  total: Int
  discount: Discount
  donation: DonationInfo
  billingDate: DateTime
}

type Checkout {
  orderId: ID!
  sessionId: ID!
  total: Int!,
  discount: Int!,
  tax: Int!,
}

`
