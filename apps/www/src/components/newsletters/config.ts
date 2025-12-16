import { NewsletterName } from '#graphql/republik-api/__generated__/gql/graphql'
import { type StaticImageData } from 'next/image'
import nlClimate from './assets/nl_challenge_accepted.png'
import nlProjectR from './assets/nl_project_r.png'
import nlSunday from './assets/nl_republik_am_sonntag.png'
import nlWeekly from './assets/nl_republik_am_wochenende.png'
import nlDaily from './assets/nl_republik_heute.png'
import nlWdwww from './assets/nl_wdwww.png'

export const NL_FEATURED = [
  NewsletterName.Daily,
  NewsletterName.Wdwww,
  NewsletterName.Weekly,
]

export const NL_MORE = [
  NewsletterName.Climate,
  NewsletterName.Sunday,
  NewsletterName.Projectr,
]

export const NL_STYLE: { [key: string]: { imageSrc: StaticImageData } } = {
  [NewsletterName.Daily]: {
    imageSrc: nlDaily,
  },
  [NewsletterName.Wdwww]: {
    imageSrc: nlWdwww,
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
  [NewsletterName.Projectr]: {
    imageSrc: nlProjectR,
  },
}
