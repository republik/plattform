module.exports = `
schema {
  mutation: mutations
}

type mutations {
  acknowledgeCallToAction(id: ID!, response: JSON): CallToAction!
}
`
