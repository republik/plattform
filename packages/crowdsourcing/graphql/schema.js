module.exports = `

schema {
  mutation: mutations
}
type mutations {
  submitInheritanceStory(
    email: String!
    content: String!
    category: InheritanceStoryCategory!
  ):Boolean
}
`
