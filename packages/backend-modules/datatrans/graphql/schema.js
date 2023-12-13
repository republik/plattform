module.exports = `

schema {
  mutation: mutations
}

type mutations {
  datatransInit(
    pledgeId: ID!
    service: DatatransService
  ): DatatransInitResponse!
  datatransAuthorize(
    pledgeId: ID!
    sourceId: ID!
  ): DatatransAuthorizeResponse!
}

`
