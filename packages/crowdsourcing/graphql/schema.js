module.exports = `

schema {
  mutation: mutations
}
type mutations {
  submitInheritanceStory(
    email: String!
    tel: String
    content: String!
  ):Boolean
}
`
