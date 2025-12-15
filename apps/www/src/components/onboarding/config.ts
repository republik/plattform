import { NewsletterName } from '#graphql/republik-api/__generated__/gql/graphql'
import { type StaticImageData } from 'next/image'

import formatBinswanger from './assets/format-binswanger.png'
import formatWieRedenWirEigentlich from './assets/format-format-wie-reden-wir-eigentlich.png'
import formatGedankensplitter from './assets/format-gedankensplitter.png'
import formatPfister from './assets/format-pfister.png'
import formatRosenwasser from './assets/format-rosenwasser.png'
import formatVahland from './assets/format-vahland.png'
import nlClimate from './assets/nl_challenge_accepted.png'
import nlSunday from './assets/nl_republik_am_sonntag.png'
import nlWeekly from './assets/nl_republik_am_wochenende.png'
import nlDaily from './assets/nl_republik_heute.png'

export const NL_FEATURED: NewsletterName[] = [
  NewsletterName.Daily,
  NewsletterName.Wdwww,
  NewsletterName.Weekly,
]
export const NL_MORE: NewsletterName[] = [
  NewsletterName.Climate,
  NewsletterName.Sunday,
]

type StyleType = {
  backgroundColor?: string
  color?: string
  imageSrc?: StaticImageData
}

export const NL_STYLE: { [key: string]: StyleType } = {
  [NewsletterName.Daily]: {
    imageSrc: nlDaily,
  },
  [NewsletterName.Wdwww]: {
    imageSrc: nlDaily,
  },
  [NewsletterName.Weekly]: {
    imageSrc: nlWeekly,
  },
  [NewsletterName.Climate]: {
    imageSrc: nlClimate,
  },
  [NewsletterName.Sunday]: {
    imageSrc: nlSunday,
  },
}

export const FORMATS_FEATURED: string[] = [
  'republik/format-binswanger',
  'republik/format-rosenwasser',
  'republik/format-vahland',
  'republik/format-pfister',
  'republik/format-gedankensplitter',
  'republik/format-format-wie-reden-wir-eigentlich',
]

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

export type AuthorType = { id: string; slug: string }

export const AUTHORS_FEATURED: AuthorType[] = [
  { id: '6ae2733e-1562-47b3-881c-88e9d3d28da9', slug: 'adriennefichter' },
  { id: 'ae2dd456-9077-4f7c-9aa8-af910adf6a02', slug: 'dbuehler' },
  { id: '5660793c-51a0-486f-99c0-3dadf226d8c1', slug: 'sabrinamweiss' },
  { id: 'd2ab7a77-d086-45c7-b6ab-71e4c14848d7', slug: 'palbrecht' },
  { id: '9a29d944-85af-4c60-be1b-76cb56e409f2', slug: 'angelikahardegger' },
  { id: 'd7a4b060-644b-4265-9dca-9e7a95d70e38', slug: 'ceisenach' },
  { id: '186e0a00-3ab5-4246-87a5-6bc44d6fca95', slug: 'graf' },
  { id: '02852b61-aa45-4dab-8d23-a0c71d3e05f7', slug: 'bhurlimann' },
  { id: '5b6da6a6-c9fa-4ebb-a020-8dc85258310e', slug: 'chanimann' },
  { id: 'f565eb39-460e-46f7-bb33-9ef18199dafc', slug: 'luciaherrmann' },
  { id: 'f2fdfd74-3177-41f2-9738-d00b28de2c1a', slug: 'ywegelin' },
  { id: 'c8fe5f34-0130-4049-831b-c32fe471a705', slug: 'asscholl' },
]

export const PODCASTS_FEATURED: string[] = [
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
}

// STAGING
/* export const PODCASTS_FEATURED: string[] = [
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
} */
