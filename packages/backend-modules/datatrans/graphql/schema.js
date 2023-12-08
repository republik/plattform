module.exports = `

schema {
  mutation: mutations
}

type mutations {
  datatransInit(
    pledgeId: String!
    service: DatatransService
  ): DatatransInitResponse!
}

`
