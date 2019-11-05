const defaultMarks = {
  outerOpening: '«',
  outerClosing: '»',
  innerOpening: '‹',
  innerClosing: '›'
}

export const inQuotes = (str, marks = defaultMarks) => {
  let quotedStr = str.trim()
  if (
    quotedStr.startsWith(marks.outerOpening) &&
    quotedStr.endsWith(marks.outerClosing)
  ) {
    return quotedStr
  }
  quotedStr = quotedStr
    .replace(marks.outerOpening, marks.innerOpening)
    .replace(marks.outerClosing, marks.innerClosing)
  return marks.outerOpening + quotedStr + marks.outerClosing
}
