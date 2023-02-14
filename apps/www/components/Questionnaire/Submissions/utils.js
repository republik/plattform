export const replaceText = (text, { name, answerText, questionText }) => {
  return (
    text &&
    text
      .replace('{name}', name)
      .replace('{answerText}', answerText)
      .replace('{questionText}', questionText)
  )
}
