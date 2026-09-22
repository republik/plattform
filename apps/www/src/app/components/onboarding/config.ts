// Disabled static image imports because of sharp-related build errors on Vercel
// import { type StaticImageData } from 'next/image'
// import formatBinswanger from './assets/format-binswanger.png'
// import formatWieRedenWirEigentlich from './assets/format-format-wie-reden-wir-eigentlich.png'
// import formatGedankensplitter from './assets/format-gedankensplitter.png'
// import formatPfister from './assets/format-pfister.png'
// import formatRosenwasser from './assets/format-rosenwasser.png'
// import formatVahland from './assets/format-vahland.png'
const formatBinswanger = '/static/onboarding/format-binswanger.png'
const formatWieRedenWirEigentlich =
  '/static/onboarding/format-format-wie-reden-wir-eigentlich.png'
const formatGedankensplitter = '/static/onboarding/format-gedankensplitter.png'
const formatPfister = '/static/onboarding/format-pfister.png'
const formatRosenwasser = '/static/onboarding/format-rosenwasser.png'
const formatVahland = '/static/onboarding/format-vahland.png'

type StyleType = {
  author?: string
  backgroundColor?: string
  color?: string
  // imageSrc?: StaticImageData
  imageSrc?: string
}

// Sanity articleCollection IDs
export const FORMATS_FEATURED: string[] = [
  '66a6167d-9bb4-540a-a1a6-5ab9d6e1b95c', // Binswanger
  '574d5260-3cd5-56b5-a822-09d24fb9af30', // Rosenwasser
  'fda13d89-c89a-5fe3-8d93-6fbd943554fb', // Vahland
  'deb07ccb-8502-53cc-a2c5-75c1054b3f8b', // Pfister
  '6b669e3c-b75a-5bf7-bb82-e82d5a19bce0', // Strassberg
  '455aceb9-3537-5aef-8f5b-88baffbe509f', // Wie reden wir eigentlich
]

export const FORMATS_STYLE: { [key: string]: StyleType } = {
  // Binswanger
  '66a6167d-9bb4-540a-a1a6-5ab9d6e1b95c': {
    backgroundColor: '#EEB8BF',
    author: 'Daniel Binswanger',
    imageSrc: formatBinswanger,
  },
  // Rosenwasser
  '574d5260-3cd5-56b5-a822-09d24fb9af30': {
    backgroundColor: '#8CDBB6',
    author: 'Anna Rosenwasser',
    imageSrc: formatRosenwasser,
  },
  // Vahland
  'fda13d89-c89a-5fe3-8d93-6fbd943554fb': {
    backgroundColor: '#A9A7E0',
    author: 'Kia Vahland',
    imageSrc: formatVahland,
  },
  // Pfister
  'deb07ccb-8502-53cc-a2c5-75c1054b3f8b': {
    backgroundColor: '#EF6B6D',
    author: 'Gerhard Pfister',
    imageSrc: formatPfister,
  },
  // Strassberg
  '6b669e3c-b75a-5bf7-bb82-e82d5a19bce0': {
    backgroundColor: '#F2ECE6',
    author: 'Daniel Strassberg',
    imageSrc: formatGedankensplitter,
  },
  // Wie reden wir eigentlich
  '455aceb9-3537-5aef-8f5b-88baffbe509f': {
    backgroundColor: '#DAFF8D',
    author: 'Marie-José Kolly',
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
  { id: 'ad3d0577-451d-42dd-b0f0-30fd41061892', slug: 'vheintges' },
]

export const PODCASTS_FEATURED: string[] = [
  // Dritte Gewalt
  '67a3bf52-70d7-5457-85cd-de16425eaacb',
  // Sondersession
  '94032342-f283-50c9-b846-96a793abc386',
  // Gute Frage
  '13327b71-46ef-58f3-9f06-72b5732f37af',
  // Update!
  'c06e068c-6823-52cd-a16d-43fea77012f8',
]

export const PODCASTS_STYLE: { [key: string]: StyleType } = {
  // Dritte Gewalt
  '67a3bf52-70d7-5457-85cd-de16425eaacb': {
    backgroundColor: '#3C1F59',
    color: '#00FFFF',
  },
  // Sondersession
  '94032342-f283-50c9-b846-96a793abc386': {
    backgroundColor: '#025E58',
    color: '#FFB6EF',
  },
  // Gute Frage
  '13327b71-46ef-58f3-9f06-72b5732f37af': {
    backgroundColor: '#890024',
    color: '#FF416D',
  },
  // Update!
  'c06e068c-6823-52cd-a16d-43fea77012f8': {
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
