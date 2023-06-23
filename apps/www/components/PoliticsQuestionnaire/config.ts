import { scaleOrdinal } from 'd3-scale'

export const leftJoin = (objArr1, objArr2, key) =>
  objArr1.map((anObj1) => ({
    ...objArr2.find((anObj2) => anObj1[key] === anObj2[key]),
    ...anObj1,
  }))

// TODO: use correct color palette
export const QUESTIONNAIRE_BG_COLOR = '#ffdc5e'
const COLORS = ['#ffdd5e', '#ce9fc7', '#67a9d9', '#f49787', '#75d69c']

export const questionColor = scaleOrdinal(
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  COLORS,
)

type QuestionConfigOrder = {
  questionSlugs: string[]
}

type QuestionConfigType = {
  questionSlug: string
  type: string
  options?: string[]
}

export const QUESTIONS: QuestionConfigOrder[] = [
  {
    questionSlugs: [
      'welche-partei-musste-aus-ihrer-sicht-neu-gegrundet-werden',
    ],
  },
  { questionSlugs: ['ihr-grundsatz'] },
  { questionSlugs: ['wo-geben-sie-gern-nach'] },
  {
    questionSlugs: [
      'ab-welcher-ferien-destinations-distanz-ist-fliegen-erlaubt',
    ],
  },
  { questionSlugs: ['ihr-verhaltnis-zu-sand'] },
  { questionSlugs: ['es-ist-ein-tag-vor-ferienende-ihre-stimmung'] },
]

export const QUESTION_TYPES: QuestionConfigType[] = [
  {
    questionSlug: 'welche-partei-musste-aus-ihrer-sicht-neu-gegrundet-werden',
    type: 'text',
  },
  {
    questionSlug: 'ihr-grundsatz',
    type: 'text',
  },
  {
    questionSlug: 'wo-geben-sie-gern-nach',
    type: 'text',
  },
  {
    questionSlug: 'ab-welcher-ferien-destinations-distanz-ist-fliegen-erlaubt',
    type: 'text',
  },
  {
    questionSlug: 'ihr-verhaltnis-zu-sand',
    type: 'choice',
    options: ['Gut, danke der Nachfrage', 'nein', 'vielleicht'],
  },
  {
    questionSlug: 'es-ist-ein-tag-vor-ferienende-ihre-stimmung',
    type: 'text',
  },
]

export const OVERVIEW_QUESTIONNAIRE_PATH = '/politikerfragebogen-2023'

export const QUESTIONNAIRE_SLUG = 'politiker-wahlen'

export const QUESTIONNAIRE_SQUARE_IMG_URL =
  'https://cdn.repub.ch/s3/republik-assets/repos/republik/page-klimafragebogen-uebersicht/files/034a0eca-8aaf-4511-90aa-504cca584981/final-art_questionnaire.png'
