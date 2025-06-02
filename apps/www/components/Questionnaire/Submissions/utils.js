import { scaleOrdinal } from 'd3-scale'

export const replaceText = (text, { name, answerText, questionText }) => {
  return (
    text &&
    text
      .replace('{name}', name)
      .replace('{answerText}', answerText)
      .replace('{questionText}', questionText)
  )
}

export const getOrdinalColors = (colors) => scaleOrdinal(
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  colors,
)
