import { QUESTION_TYPES } from './config'

export const leftJoin = (objArr1: object[], objArr2: object[], key: string) =>
  objArr1.map((anObj1) => ({
    ...objArr2.find((anObj2) => anObj1[key] === anObj2[key]),
    ...anObj1,
  }))

export const getTypeBySlug = (slug: string) =>
  QUESTION_TYPES.find((q) => q.questionSlug === slug).type
