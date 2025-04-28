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
    complimentaryItems: [ComplimentaryItemOrder]
    options: CheckoutSessionOptions
  ): CheckoutSession
  cancelMagazineSubscription(subscriptionId: ID!, details: CancellationInput!, cancelImmediately: Boolean): Boolean
  reactivateMagazineSubscription(subscriptionId: ID!): Boolean
  updateMagazineSubscriptionDonation(
    subscriptionId: ID!
    selectedDonation: ID
    donationAmount: Int
  ): Boolean
  createStripeCustomerPortalSession(companyName: CompanyName): CustomerPortalSession
}
`
