// TODO: move to env variables

import { NewsletterName } from '#graphql/republik-api/__generated__/gql/graphql'

export const NL_FEATURED: NewsletterName[] = [
  NewsletterName.Daily,
  NewsletterName.Wdwww,
  NewsletterName.Weekly,
]
export const NL_MORE: NewsletterName[] = [
  NewsletterName.Climate,
  NewsletterName.Sunday,
]

export const FORMATS_FEATURED: string[] = [
  'republik/format-binswanger',
  'republik/format-rosenwasser',
  'republik/format-vahland',
  'republik/format-pfister',
  'republik/format-format-wie-reden-wir-eigentlich',
  'republik/format-gedankensplitter',
]

// TODO: slugs can change (though not so often) -> use ID
export const AUTHORS_FEATURED: string[] = [
  'adriennefichter',
  'bhurlimann',
  'sabrinamweiss',
  'angelikahardegger',
  'eblulle',
]

export const PODCASTS_FEATURED: string[] = [
  'republik/format-dritte-gewalt',
  'republik/format-sondersession',
  'republik/format-gute-frage',
  'republik/format-was-wurde-eigentlich-aus',
]
