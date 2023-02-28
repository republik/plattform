import { scaleOrdinal } from 'd3-scale'

// TODO: remove actual IDs from here
// TODO: use correct color palette
export const questionColor = scaleOrdinal(
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  ['#c8c8ba', '#bae1b4', '#a7f9ae', '#67b6b1', '#2d72a9'],
)

type QuestionConfigType = {
  ids: number[]
  valueLength?: {
    min?: number
    max?: number
  }
}

// TODO: adjust min and max length
export const QUESTIONS: QuestionConfigType[] = [
  { ids: [0, 1] },
  { ids: [2, 3], valueLength: { max: 50 } },
  { ids: [4, 5], valueLength: { min: 30, max: 100 } },
  { ids: [6], valueLength: { max: 100 } },
  { ids: [7], valueLength: { min: 150 } },
  { ids: [8] },
  { ids: [9], valueLength: { max: 100 } },
  { ids: [10], valueLength: { max: 100 } },
  { ids: [11], valueLength: { max: 100 } },
  { ids: [12, 13], valueLength: { max: 100 } },
  { ids: [14], valueLength: { min: 150 } },
]

export const EDIT_QUESTIONNAIRE_PATH = '/2023/02/13/klimafragebogen-fragen'
