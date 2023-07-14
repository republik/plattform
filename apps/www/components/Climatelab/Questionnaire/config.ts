import { scaleOrdinal } from 'd3-scale'

// TODO: use correct color palette
export const QUESTIONNAIRE_BG_COLOR = '#ffdc5e'
const COLORS = ['#ffdd5e', '#ce9fc7', '#67a9d9', '#f49787', '#75d69c']

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

// TODO: adjust min and max length
export const QUESTIONS: QuestionConfigType[] = [
  { ids: [0, 1] },
  { ids: [2, 3], valueLength: { min: 100, max: 250 } },
  { ids: [4, 5], valueLength: { min: 5, max: 100 } },
  {
    ids: [6],
    valueLength: { min: 5, max: 200 },
    hint: 'Tippen Sie eine Antwort an, um den ganzen Fragebogen dieser Person zu sehen.',
  },
  { ids: [7], valueLength: { min: 5, max: 200 } },
  { ids: [8] },
  { ids: [9], valueLength: { min: 5, max: 200 } },
  { ids: [10], valueLength: { min: 5, max: 80 } },
  { ids: [11], valueLength: { min: 5, max: 200 } },
  { ids: [12, 13], valueLength: { min: 5, max: 100 } },
  { ids: [14], valueLength: { min: 5 } },
]

export const EDIT_QUESTIONNAIRE_PATH = '/2023/03/03/fragen-zur-klimakrise'
export const OVERVIEW_QUESTIONNAIRE_PATH = '/15-fragen-zum-klima-ihre-antworten'

export const PERSON_PAGE_PATH = 'klimafragebogen'
export const PERSON_SHARE_TEXT = '15 Fragen zum Klima – die Antworten von '
export const ILLU_CREDIT = 'Cristina Spanò'

export const QUESTIONNAIRE_SLUG = 'klima-fragebogen'

export const QUESTIONNAIRE_SQUARE_IMG_URL =
  'https://cdn.republik.pink/s3/republik-assets-staging/repos/republik/love-page-politik-community-fragebogen-uebersicht/files/904251f8-9e8e-484b-8a68-5ce95ea3271e/waehlerinnen_share.png'
