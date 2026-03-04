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
import nlProjectR from './assets/06_Project_R_L.svg'
import nlBabDark from './assets/07_BaB_D.svg'
import nlBab from './assets/07_BaB_L.svg'
import nlTechDark from './assets/08_Tech_D.svg'
import nlTech from './assets/08_Tech_L.svg'

export type NewsletterName =
  | 'DAILY'
  | 'WEEKLY'
  | 'WDWWW'
  | 'BAB'
  | 'TECH'
  | 'CLIMATE'
  | 'SUNDAY'
  | 'PROJECTR'

export const NL_FEATURED: NewsletterName[] = ['DAILY', 'WDWWW', 'WEEKLY']

export const NL_MORE: NewsletterName[] = [
  'BAB',
  'TECH',
  'CLIMATE',
  'SUNDAY',
  'PROJECTR',
]

export const NL_STYLE: Record<
  NewsletterName,
  { imageSrc: StaticImageData; imageSrcDark: StaticImageData }
> = {
  DAILY: {
    imageSrc: nlDaily,
    imageSrcDark: nlDailyDark,
  },
  WDWWW: {
    imageSrc: nlWdwww,
    imageSrcDark: nlWdwwwDark,
  },
  WEEKLY: {
    imageSrc: nlWeekly,
    imageSrcDark: nlWeeklyDark,
  },
  BAB: {
    imageSrc: nlBab,
    imageSrcDark: nlBabDark,
  },
  TECH: {
    imageSrc: nlTech,
    imageSrcDark: nlTechDark,
  },
  CLIMATE: {
    imageSrc: nlClimate,
    imageSrcDark: nlClimateDark,
  },
  SUNDAY: {
    imageSrc: nlSunday,
    imageSrcDark: nlSundayDark,
  },
  PROJECTR: {
    imageSrc: nlProjectR,
    imageSrcDark: nlProjectRDark,
  },
}
