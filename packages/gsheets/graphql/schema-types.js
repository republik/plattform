module.exports = `

type Faq {
  category: String
  question: String
  answer: String
}

type Event {
  slug: String
  title: String
  description: String
  link: String
  date: Date
  time: String
  where: String
  locationLink: String
  metaDescription: String
  socialMediaImage: String
}

type Update {
  slug: String
  title: String
  text: String
  publishedDateTime: DateTime
  metaDescription: String
  socialMediaImage: String
}

type MediaResponse {
  medium: String
  publishDate: String
  title: String
  url: String
}

type Employee {
  group: String
  subgroup: String
  name: String
  title: String
  greeting: String
  user: User
}
`
