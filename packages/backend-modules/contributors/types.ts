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

export type ContributorGender = 'm' | 'f' | 'd' | 'na'

export function isContributorGender(genderString: string): genderString is ContributorGender {
  return ['m', 'f', 'd', 'na'].includes(genderString);
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
  gender?: ContributorGender
  user_id?: string
  created_at: Date
  updated_at: Date
}

export type ContributorArgs = {
  id?: string
  slug?: string
}

export type GsheetAuthorGender = 'f' | 'm' | 'n' | 'b'

export type GsheetAuthor = { name: string; gender: GsheetAuthorGender }

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
