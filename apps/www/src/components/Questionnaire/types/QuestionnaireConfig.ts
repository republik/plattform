type QuestionConfigType = {
  ids: number[]
  valueLength?: {
    min?: number
    max?: number
  }
  hint?: string
}

type QuestionnaireDesign = {
  bgColor: string
  colors: string[]
  shareImg: string
}

export type QuestionnaireConfigType = {
  dbSlug: string
  questionsStruct: QuestionConfigType[]
  formPage: string
  design: QuestionnaireDesign
  title: string
}
