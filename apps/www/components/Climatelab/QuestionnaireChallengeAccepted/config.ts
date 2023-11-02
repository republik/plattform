import { scaleOrdinal } from 'd3-scale'

// TODO: use correct color palette
export const QUESTIONNAIRE_BG_COLOR = '#EBEA2B'
const COLORS = ['#EBEA2B', '#E595D9', '#5AC5E1', '#FF9273', '#6CC485']

// #02b3e0

export const questionColor = scaleOrdinal(
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  COLORS,
)

type QuestionConfigType = {
  ids: number[]
  valueLength?: {
    min?: number
    max?: number
  }
  hint?: string
}

export const QUESTIONS: QuestionConfigType[] = [
  { ids: [0] },
  { ids: [1], valueLength: { min: 5, max: 200 } },
  { ids: [2], valueLength: { min: 5, max: 150 } },
  { ids: [3], valueLength: { min: 5, max: 50 } },
  { ids: [4], valueLength: { min: 50, max: 150 } },
  { ids: [5], valueLength: { min: 80, max: 200 } },
  { ids: [6], valueLength: { min: 5, max: 100 } },
  { ids: [7], valueLength: { min: 5, max: 200 } },
  { ids: [8], valueLength: { min: 5, max: 50 } },
]

// TODO: correct urls and share texts
export const EDIT_QUESTIONNAIRE_PATH =
  '/2023/11/07/wie-blicken-sie-zurzeit-auf-die-klimakrise'
export const OVERVIEW_QUESTIONNAIRE_PATH = '/so-blicken-sie-auf-die-klimakrise'
export const PERSON_PAGE_PATH = 'fragebogen-klimakrise'
export const PERSON_PAGE_TITLE =
  'Wie blicken Sie zurzeit auf die Klimakrise? Die Antworten von {name}'
export const PERSON_META_TITLE = 'Wie blicken Sie zurzeit auf die Klimakrise?'
export const PERSON_META_DESCRIPTION =
  'Das sind die Antworten von {name}. Was sind Ihre?'
export const PERSON_SHARE_TEXT =
  'Wie blicken Sie zurzeit auf die Klimakrise? Die Antworten von {name}'

export const QUESTIONNAIRE_SLUG = 'klima-fragebogen-v2'

export const QUESTIONNAIRE_SQUARE_IMG_URL =
  'https://cdn.repub.ch/s3/republik-assets/repos/republik/article-klimafragebogen-version-2-uebersichtsseite/images/df9fec323575229d1578831affe5c79c02275cd3.png?resize=800x'

export const ILLU_CREDIT = 'Cristina Spanò'
