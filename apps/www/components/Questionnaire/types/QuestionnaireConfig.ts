type QuestionConfigType = {
  ids: number[]
  valueLength?: {
    min?: number
    max?: number
  }
  hint?: string
}

type QuestionnaireImg = {
  credit: string
  url: string
  urlSquare: string // share image
}

type QuestionnairePaths = {
  overviewPage: string
  personPage?: string
  formPage?: string
}

type QuestionnaireDesign = {
  bgColor: string
  colors: string[]
  img: QuestionnaireImg
}

type PageData = {
  title?: string
  metaTitle?: string
  metaDescription?: string
  shareText?: string
}

export type QuestionnaireConfig = {
  dbSlug: string
  questionsStruct: QuestionConfigType[]
  paths: QuestionnairePaths
  design: QuestionnaireDesign
  overviewPage?: PageData
  personPage?: PageData
}
