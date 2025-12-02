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

export const FORMATS_BG: { [key: string]: string } = {
  'republik/format-binswanger': '#D6CCCB',
  'republik/format-rosenwasser': '#CF8D82',
  'republik/format-vahland': '#C1C06A',
  'republik/format-pfister': '#BAB0DC',
  'republik/format-format-wie-reden-wir-eigentlich': '#B9919E',
  'republik/format-gedankensplitter': '#A1B3A6',
}

// TODO: slugs can change (though not so often) -> use ID
export const AUTHORS_FEATURED: string[] = [
  'adriennefichter',
  'dbuehler',
  'sabrinamweiss',
  'palbrecht',
  'angelikahardegger',
  'ceisenach',
  'graf',
  'bhurlimann',
  'chanimann',
  'luciaherrmann',
]

export const PODCASTS_FEATURED: string[] = [
  'republik/format-dritte-gewalt',
  'republik/format-sondersession',
  'republik/format-gute-frage',
  'republik/format-was-wurde-eigentlich-aus',
]

// STAGING
/*export const PODCASTS_FEATURED: string[] = [
  'republik/format-am-klavier',
  'republik/format-wochenrevue',
  'republik/format-republik-live',
  'republik/format-im-gespraech',
]*/
