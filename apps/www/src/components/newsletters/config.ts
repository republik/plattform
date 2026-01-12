import { NewsletterName } from '#graphql/republik-api/__generated__/gql/graphql'
import { type StaticImageData } from 'next/image'
import nlDailyDark from './assets/01_Heute_D.svg'
import nlDaily from './assets/01_Heute_L.svg'
import nlClimateDark from './assets/02_CA_D.svg'
import nlClimate from './assets/02_CA_L.svg'
import nlWeeklyDark from './assets/03_WE_D.svg'
import nlWeekly from './assets/03_WE_L-07.svg'
import nlWdwwwDark from './assets/04_WWW_D.svg'
import nlWdwww from './assets/04_WWW_L.svg'
import nlSundayDark from './assets/05_Sonntag_D.svg'
import nlSunday from './assets/05_Sonntag_L.svg'
import nlProjectRDark from './assets/06_Project_R_D.svg'
import nlProjectR from './assets/07_Project_R_L.svg'

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

export const NL_STYLE: {
  [key: string]: { imageSrc: StaticImageData; imageSrcDark: StaticImageData }
} = {
  [NewsletterName.Daily]: {
    imageSrc: nlDaily,
    imageSrcDark: nlDailyDark,
  },
  [NewsletterName.Wdwww]: {
    imageSrc: nlWdwww,
    imageSrcDark: nlWdwwwDark,
  },
  [NewsletterName.Weekly]: {
    imageSrc: nlWeekly,
    imageSrcDark: nlWeeklyDark,
  },
  [NewsletterName.Climate]: {
    imageSrc: nlClimate,
    imageSrcDark: nlClimateDark,
  },
  [NewsletterName.Sunday]: {
    imageSrc: nlSunday,
    imageSrcDark: nlSundayDark,
  },
  [NewsletterName.Projectr]: {
    imageSrc: nlProjectR,
    imageSrcDark: nlProjectRDark,
  },
}
