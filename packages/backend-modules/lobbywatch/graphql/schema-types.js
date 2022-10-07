module.exports = `

enum Locale {
  de
  fr
}

type Translation {
  key: String!,
  value: String
}

# CMS

type MenuLink {
  id: ID!
  parentId: ID!
  title: String
  href: String
}
type Block {
  id: ID!
  region: String
  # deprecated
  key: String
  title: String
  content: String
}
type Meta {
  id: ID!
  blocks(region: String): [Block!]!
  links: [MenuLink!]!
}
type PageTranslations {
  locale: String!
  path: [String!]!
}
type Page {
  nid: ID!
  statusCode: Int
  path: [String!]!
  translations: [PageTranslations!]!
  title: String
  image: String
  author: String
  authorUid: Int
  content: String
  lead: String!
  type: String!
  # deprecated
  created: String
  # DD.MM.YYYY HH:MM
  published: String
  updated: String
  # YYYY-MM-DD
  publishedIso: String
  updatedIso: String
  categories: [String!]
  tags: [String!]
  lobbyGroups: [String!]
}
type ArticleList {
  pages: Int!
  list: [Page!]!
}


# LW Data

enum Gender {
  M
  F
}

interface Person {
  name: String!
  firstName: String
  middleName: String
  lastName: String
  occupation: String
  gender: Gender
  # Format: DD.MM.YYYY
  dateOfBirth: String
  website: String
  wikipedia_url: String
  wikidata_url: String
  twitter_name: String
  twitter_url: String
  linkedin_url: String
  facebook_name: String
  facebook_url: String
}

type Party {
  name: String!
  abbr: String!
  wikipedia_url: String
  wikidata_url: String
  twitter_name: String
  twitter_url: String
}

type PartyMembership {
  party: Party!
  function: String
}

enum Council {
  NR
  SR
}

type Commission {
  id: ID!
  name: String!
  abbr: String!
  wikipedia_url: String
  wikidata_url: String
}

type Compensation {
  year: Int!
  # measured in yearly CHF
  money: Int
  description: String
}

enum CompensationTransparenceState {
  YES
  NO
  PARTIAL
}

type CompensationTransparence {
  dueDate: String!
  isTansparent: CompensationTransparenceState
}

enum Potency {
  HIGH
  MEDIUM
  LOW
}

type Organisation {
  id: ID!
  updated: String!
  published: String!
  updatedIso: String!
  publishedIso: String!
  name: String!
  abbr: String
  legalForm: String
  location: String
  postalCode: String
  countryIso2: String
  description: String
  uid: String
  website: String
  lobbyGroups: [LobbyGroup!]!
  connections: [Connection!]!
  wikipedia_url: String
  wikidata_url: String
  twitter_name: String
  twitter_url: String
}

type Guest implements Person {
  id: ID!
  updated: String!
  published: String!
  updatedIso: String!
  publishedIso: String!
  name: String!
  firstName: String!
  middleName: String
  lastName: String!
  occupation: String
  gender: Gender
  # Format: DD.MM.YYYY
  dateOfBirth: String
  website: String
  wikipedia_url: String
  wikidata_url: String
  twitter_name: String
  twitter_url: String
  linkedin_url: String
  facebook_name: String
  facebook_url: String
  connections: [Connection!]!
  function: String,
  parliamentarian: Parliamentarian!
}

type LobbyGroup {
  id: ID!
  updated: String!
  published: String!
  updatedIso: String!
  publishedIso: String!
  name: String!
  description: String
  sector: String
  branch: Branch
  wikipedia_url: String
  wikidata_url: String
  commissions: [Commission!]!
  connections: [Connection]
}

type Branch {
  id: ID!
  updated: String!
  published: String!
  updatedIso: String!
  publishedIso: String!
  name: String!
  description: String
  wikipedia_url: String
  wikidata_url: String
  commissions: [Commission!]!
  connections: [Connection]
}

union Entity = Parliamentarian | Organisation | Guest | LobbyGroup | Branch

type Connection {
  from: Entity!
  to: Entity!
  vias: [Connection!]!
  # Last available compensation
  compensation: Compensation
  # Yearly compensations
  compensations: [Compensation!]
  group: String
  potency: Potency
  function: String
  description: String
}

type Parliamentarian implements Person {
  id: ID!
  updated: String!
  published: String!
  updatedIso: String!
  publishedIso: String!
  name: String!
  parliamentId: ID!
  firstName: String!
  middleName: String
  lastName: String!
  occupation: String
  gender: Gender
  # Format: DD.MM.YYYY
  dateOfBirth: String
  age: Int
  portrait: String
  partyMembership: PartyMembership
  canton: String!
  active: Boolean!
  council: Council!
  councilTitle: String!
  # In number of months
  councilTenure: Int
  # Format: DD.MM.YYYY
  councilJoinDate: String!
  # Format: DD.MM.YYYY
  councilExitDate: String
  # Number of people
  represents: Int
  children: Int
  civilStatus: String
  website: String
  wikipedia_url: String
  wikidata_url: String
  twitter_name: String
  twitter_url: String
  linkedin_url: String
  facebook_name: String
  facebook_url: String
  parlament_biografie_url: String
  commissions: [Commission!]!
  connections: [Connection!]!
  guests: [Guest!]!
  compensationTransparence: CompensationTransparence
}

`
