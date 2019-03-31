module.exports = `

schema {
  mutation: mutations
}

type mutations {
  submitInheritanceStory(
    email: String!
    tel: String
    content: String!
    count: Int
    inheritanceFrom: String
    inheritanceType: String
    value: String 
    inheritanceBattle: Boolean
    heritage: String
    testament: Boolean 
  ):Boolean
}
`
