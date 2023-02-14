export const replaceText = (
  text,
  { name, answerText, questionText, questionCount },
) => {
  return (
    text &&
    text
      .replace('{name}', name)
      .replace('{answerText}', answerText)
      .replace('{questionText}', questionText)
      .replace('{restQuestionCount}', questionCount - 1)
  )
}
