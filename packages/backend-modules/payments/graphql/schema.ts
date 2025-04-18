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
    withSelectedDiscount: ID
    complimentaryItems: [ComplimentaryItemOrder]
    options: CheckoutSessionOptions
  ): CheckoutSession
  cancelMagazineSubscription(subscriptionId: String!, details: CancellationInput, cancelImmediately: Boolean): Boolean
  reactivateMagazineSubscription(subscriptionId: String!): Boolean
  updateMagazineSubscriptionDonation(
    subscriptionId: String!
    selectedDonation: ID
    donationAmount: Int
  ): Boolean
  createStripeCustomerPortalSession(companyName: CompanyName): CustomerPortalSession
}
`
