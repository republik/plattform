module.exports = `

schema {
  mutation: mutations
}

type mutations {
  submitInheritanceStory(
    email: String!
    tel: String
    content: String!
    count: Integer
    inheritanceFrom: InheritanceFrom
    inheritanceType: InheritanceCategory
    value: String 
    inheritanceBattle: boolean
    heritage: String
    testament: boolean 
  ):Boolean
}
`
