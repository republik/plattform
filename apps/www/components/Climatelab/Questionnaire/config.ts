import { scaleOrdinal } from 'd3-scale'

// TODO: remove actual IDs from here
// TODO: use correct color palette
export const questionColor = scaleOrdinal(
  [
    'b6c53dce-3865-4fd9-980d-d47ece330131',
    'ca6c5d5c-0f80-497f-a1d4-9e1a70806fd2',
    '23e013a8-c864-4e9e-be4e-7126204ac8ab',
    'b28e5a47-b93a-4729-9639-82a4c059db4c',
    '800a7a31-d238-41af-b5e7-272063fd2a41',
    '5b90681f-5070-47f8-9a77-9d6a246d9710',
    'c92b4e81-8cc1-42bc-a840-552a38162289',
    '1a2fa0d4-d3a3-4791-91f0-576d033d44b3',
    '9ec48ec4-dc31-4542-a971-37c5a49073ac',
    '39bcaa2a-c3eb-469e-8bf6-60023f4ae65d',
    'f933f346-af27-47c6-b6aa-3430ab2c0376',
  ],
  ['#c8c8ba', '#bae1b4', '#a7f9ae', '#67b6b1', '#2d72a9'],
)

export const QUESTION_IDS = [
  [0, 1],
  [2, 3],
  [4, 5],
  [6],
  [7],
  [8],
  [9],
  [10],
  [11],
  [12, 13],
  [14],
] as const
