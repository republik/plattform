import { scaleOrdinal } from 'd3-scale'

// TODO: use correct color palette
export const QUESTIONNAIRE_BG_COLOR = '#ffffff'
const COLORS = ['#fff75b', '#ffe003']

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
  { ids: [10] },
  { ids: [8], valueLength: { min: 0, max: 100 } },
  {
    ids: [9],
    valueLength: { min: 100, max: 150 },
    hint: 'Tippen Sie eine Antwort an, um den ganzen Fragebogen dieser Person zu sehen.',
  },
  { ids: [3], valueLength: { min: 50, max: 100 } },
  { ids: [12], valueLength: { min: 150, max: 200 } },
  { ids: [4], valueLength: { min: 100, max: 150 } },
  { ids: [20], valueLength: { min: 0, max: 200 } },
  { ids: [16], valueLength: { min: 0, max: 100 } },
  { ids: [17], valueLength: { min: 0, max: 100 } },
  { ids: [18, 19], valueLength: { min: 0, max: 100 } },
  {
    ids: [7],
    valueLength: { min: 100, max: 200 },
  },
  { ids: [13], valueLength: { min: 0, max: 100 } },
  { ids: [14], valueLength: { min: 0, max: 100 } },
  { ids: [15], valueLength: { min: 150, max: 200 } },
  { ids: [2], valueLength: { min: 100, max: 200 } },
  { ids: [11], valueLength: { min: 100, max: 150 } },
  { ids: [23] },
  { ids: [21], valueLength: { min: 0, max: 100 } },
  { ids: [22], valueLength: { min: 0, max: 100 } },
  { ids: [1], valueLength: { min: 50, max: 150 } },
  { ids: [0], valueLength: { min: 0, max: 100 } },
  { ids: [5, 6], valueLength: { min: 0, max: 100 } },
  { ids: [24] },
  { ids: [25], valueLength: { min: 100, max: 150 } },
]

export const EDIT_QUESTIONNAIRE_PATH =
  '/2023/07/19/welche-politikerinnen-gehoeren-in-den-bundesrat-welcher-schweizer-politiker-muss-zuruecktreten'
export const OVERVIEW_QUESTIONNAIRE_PATH =
  '/politik-in-26-fragen-ihre-antworten'

export const PERSON_PAGE_PATH = 'politikfragebogen-community'
export const PERSON_SHARE_TEXT =
  '26 Sommerfragen vor der Wahl im Herbst – die Antworten von '

export const QUESTIONNAIRE_SLUG = 'politiker-fragebogen-community'

export const QUESTIONNAIRE_SQUARE_IMG_URL =
  'https://cdn.repub.ch/s3/republik-assets/repos/republik/page-politikfragebogen-community-uebersicht/files/5218448b-b513-4e11-9361-e460830dc7ef/waehlerinnen.png'

export const ILLU_SHARE =
  'https://cdn.repub.ch/s3/republik-assets/repos/republik/page-politikfragebogen-community-uebersicht/files/6a65bc4c-5383-461e-b239-f3c2f0e88f46/waehlerinnen_share.png'

export const ILLU_NIGHT_MODE =
  'https://cdn.repub.ch/s3/republik-assets/repos/republik/page-politikfragebogen-community-uebersicht/files/084c76ff-3212-42e1-b76d-4e9bdfa31dec/waehlerinnen_nachtmodus.png'

export const ILLU_CREDIT = 'Nadine Redlich'
