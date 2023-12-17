module.exports = `

schema {
  mutation: mutations
}

type mutations {
  datatransAuthorize(
    pledgeId: ID!
    sourceId: ID!
  ): DatatransAuthorizeResponse!
  datatransInit(
    pledgeId: ID!
    method: PaymentMethod!
  ): DatatransInitResponse!
  datatransRegistration(
    method: PaymentMethod!
    companyId: ID!
  ): DatatansRegistrationResponse!
}

`
