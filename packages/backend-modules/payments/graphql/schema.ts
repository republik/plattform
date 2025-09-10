export = `

schema {
  query: queries
  mutation: mutations
}

type queries {
  getOffers(promoCode: String): [Offer!]!
  getOffer(offerId: ID!, promoCode: String): Offer
  validateGiftVoucher(voucherCode: String!): GiftVoucherValidationResult
}

type mutations {
  redeemGiftVoucher(voucherCode: String): RedeemGiftResult
  createCheckoutSession(
    offerId: ID!,
    promoCode: String,
    withDonation: ID
    withCustomDonation: CustomDonation
    withSelectedDiscount: ID,
    complimentaryItems: [ComplimentaryItemOrder]
    options: CheckoutSessionOptions
  ): CheckoutSession
  cancelMagazineSubscription(subscriptionId: ID!, details: CancellationInput!, cancelImmediately: Boolean): MagazineSubscription!
  reactivateMagazineSubscription(subscriptionId: ID!): MagazineSubscription!
  updateMagazineSubscriptionDonation(
    subscriptionId: ID!
    donationAmount: Int!
  ): MagazineSubscription!
  createStripeCustomerPortalSession(companyName: CompanyName): CustomerPortalSession
  upgradeMagazineSubscription(
    upgradeInput: MagazineSubscriptionUpgradeInput
  ): MagazineSubscriptionUpgrade
}
`
