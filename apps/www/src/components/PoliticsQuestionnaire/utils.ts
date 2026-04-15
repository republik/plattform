import { QUESTION_TYPES } from './config'

export const leftJoin = (objArr1: object[], objArr2: object[], key: string) =>
  objArr1.map((anObj1) => ({
    ...objArr2.find((anObj2) => anObj1[key] === anObj2[key]),
    ...anObj1,
  }))

export const getTypeBySlug = (slug: string) =>
  QUESTION_TYPES.find((q) => q.questionSlug === slug).type

const partyKeyValues = {
  SVP: 'SVP',
  SP: 'SP',
  Gruene: 'Grüne',
  Mitte: 'Die Mitte',
  FDP: 'FDP',
  LDP: 'LDP',
  glp: 'GLP',
  EVP: 'EVP',
}

export const partyTranslation = (key: string) => partyKeyValues[key]

const cantonKeyValues = {
  AG: 'Aargau',
  AR: 'Appenzell Ausserrhoden',
  BE: 'Bern',
  BL: 'Basel-Landschaft',
  BS: 'Basel-Stadt',
  GE: 'Genf',
  GL: 'Glarus',
  GR: 'Graubünden',
  LU: 'Luzern',
  OW: 'Obwalden',
  SG: 'St. Gallen',
  SH: 'Schaffhausen',
  SO: 'Solothurn',
  SZ: 'Schwyz',
  TG: 'Thurgau',
  TI: 'Tessin',
  UR: 'Uri',
  VD: 'Waadt',
  VS: 'Wallis',
  ZG: 'Zug',
  ZH: 'Zürich',
}

export const cantonTranslation = (key: string) => cantonKeyValues[key]
