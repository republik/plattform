module.exports = `

scalar DateTime
scalar JSON

type Meta {
  title: String
  slug: String
  image: String
  emailSubject: String
  description: String
  facebookTitle: String
  facebookImage: String
  facebookDescription: String
  twitterTitle: String
  twitterImage: String
  twitterDescription: String
  publishDate: DateTime
  template: String
}

# implements FileInterface
input DocumentInput {
  # AST of /article.md
  content: JSON!
}

interface FileInterface {
  content: JSON!
  meta: Meta!
}

type Document implements FileInterface {
  # AST of /article.md
  content: JSON!
  meta: Meta!
}
`
