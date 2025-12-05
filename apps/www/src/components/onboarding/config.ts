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
  'republik/format-gedankensplitter',
  'republik/format-format-wie-reden-wir-eigentlich',
]

type StyleType = {
  backgroundColor?: string
  color?: string
}

export const FORMATS_STYLE: { [key: string]: StyleType } = {
  'republik/format-binswanger': {
    backgroundColor: '#EEB8BF',
  },
  'republik/format-rosenwasser': {
    backgroundColor: '#8CDBB6',
  },
  'republik/format-vahland': {
    backgroundColor: '#A9A7E0',
  },
  'republik/format-pfister': {
    backgroundColor: '#EF6B6D',
  },
  'republik/format-gedankensplitter': {
    backgroundColor: '#F2ECE6',
  },
  'republik/format-format-wie-reden-wir-eigentlich': {
    backgroundColor: '#DAFF8D',
  },
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
  'ywegelin',
  'asscholl',
]

export const PODCASTS_FEATURED: string[] = [
  'republik/format-dritte-gewalt',
  'republik/format-sondersession',
  'republik/format-gute-frage',
  'republik/format-was-wurde-eigentlich-aus',
]

export const PODCASTS_STYLE: { [key: string]: StyleType } = {
  'republik/format-dritte-gewalt': {
    backgroundColor: '#EEB8BF',
  },
  'republik/format-sondersession': {
    backgroundColor: '#8CDBB6',
  },
  'republik/format-gute-frage': {
    backgroundColor: '#A9A7E0',
  },
  'republik/format-was-wurde-eigentlich-aus': {
    backgroundColor: '#EF6B6D',
  },
}

// STAGING
/*export const PODCASTS_FEATURED: string[] = [
  'republik/format-am-klavier',
  'republik/format-wochenrevue',
  'republik/format-republik-live',
  'republik/format-im-gespraech',
]*/
