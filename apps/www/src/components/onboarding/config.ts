import { NewsletterName } from '#graphql/republik-api/__generated__/gql/graphql'
import { type StaticImageData } from 'next/image'

import formatBinswanger from './assets/format-binswanger.png'
import formatWieRedenWirEigentlich from './assets/format-format-wie-reden-wir-eigentlich.png'
import formatGedankensplitter from './assets/format-gedankensplitter.png'
import formatPfister from './assets/format-pfister.png'
import formatRosenwasser from './assets/format-rosenwasser.png'
import formatVahland from './assets/format-vahland.png'

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
  imageSrc?: StaticImageData
}

export const FORMATS_STYLE: { [key: string]: StyleType } = {
  'republik/format-binswanger': {
    backgroundColor: '#EEB8BF',
    imageSrc: formatBinswanger,
  },
  'republik/format-rosenwasser': {
    backgroundColor: '#8CDBB6',
    imageSrc: formatRosenwasser,
  },
  'republik/format-vahland': {
    backgroundColor: '#A9A7E0',
    imageSrc: formatVahland,
  },
  'republik/format-pfister': {
    backgroundColor: '#EF6B6D',
    imageSrc: formatPfister,
  },
  'republik/format-gedankensplitter': {
    backgroundColor: '#F2ECE6',
    imageSrc: formatGedankensplitter,
  },
  'republik/format-format-wie-reden-wir-eigentlich': {
    backgroundColor: '#DAFF8D',
    imageSrc: formatWieRedenWirEigentlich,
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

/*export const PODCASTS_FEATURED: string[] = [
  'republik/format-dritte-gewalt',
  'republik/format-sondersession',
  'republik/format-gute-frage',
  'republik/format-was-wurde-eigentlich-aus',
]

export const PODCASTS_STYLE: { [key: string]: StyleType } = {
  'republik/format-dritte-gewalt': {
    backgroundColor: '#3C1F59',
    color: '#00FFFF',
  },
  'republik/format-sondersession': {
    backgroundColor: '#025E58',
    color: '#FFB6EF',
  },
  'republik/format-gute-frage': {
    backgroundColor: '#890024',
    color: '#FF416D',
  },
  'republik/format-was-wurde-eigentlich-aus': {
    backgroundColor: '#D4C800',
    color: '#000000',
  },
}*/

// STAGING
export const PODCASTS_FEATURED: string[] = [
  'republik/format-am-klavier',
  'republik/format-wochenrevue',
  'republik/format-republik-live',
  'republik/format-im-gespraech',
]

export const PODCASTS_STYLE: { [key: string]: StyleType } = {
  'republik/format-am-klavier': {
    backgroundColor: '#3C1F59',
    color: '#00FFFF',
  },
  'republik/format-wochenrevue': {
    backgroundColor: '#025E58',
    color: '#FFB6EF',
  },
  'republik/format-republik-live': {
    backgroundColor: '#890024',
    color: '#FF416D',
  },
  'republik/format-im-gespraech': {
    backgroundColor: '#D4C800',
    color: '#000000',
  },
}
