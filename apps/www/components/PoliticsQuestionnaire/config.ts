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
export const QUESTIONS: QuestionConfigType[] = [{ ids: [0] }]

export const OVERVIEW_QUESTIONNAIRE_PATH = '/politikerfragebogen-2023'

export const QUESTIONNAIRE_SLUG = 'politiker-wahlen'

export const QUESTIONNAIRE_SQUARE_IMG_URL =
  'https://cdn.repub.ch/s3/republik-assets/repos/republik/page-klimafragebogen-uebersicht/files/034a0eca-8aaf-4511-90aa-504cca584981/final-art_questionnaire.png'
