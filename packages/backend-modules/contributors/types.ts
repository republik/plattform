export type Contributor = {
  name: string
  slug: string
  bio?: string
  image?: string
  prolitteris_id?: string
  prolitteris_first_name?: string
  prolitteris_last_name?: string
  gender?: 'm' | 'f' | 'd' | 'na'
  user_id?: string
}

export type ContributorRow = {
  id: string
  name: string
  slug: string
  bio?: string
  image?: string
  prolitteris_id?: string
  prolitteris_first_name?: string
  prolitteris_last_name?: string
  gender?: 'm' | 'f' | 'd' | 'na'
  user_id?: string
}

export type GsheetAuthor = { name: string; gender: 'f' | 'm' | 'n' | 'b' }

export type ElasticContributorKind = string

export type ElasticContributor = {
  kind?: ElasticContributorKind
  name: string
  userId?: string
}

export type RepoData = {
  contributors: ElasticContributor[]
}

export type RawContributor = {
  name: string
  user_id?: string
}
