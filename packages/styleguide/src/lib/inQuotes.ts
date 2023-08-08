const defaultMarks = {
  outerOpening: '«',
  outerClosing: '»',
  innerOpening: '‹',
  innerClosing: '›',
}

export function inQuotes(str: string, marks = defaultMarks): string {
  let quotedStr = str.trim()
  if (
    quotedStr.startsWith(marks.outerOpening) &&
    quotedStr.endsWith(marks.outerClosing)
  ) {
    return quotedStr
  }
  quotedStr = quotedStr
    .replace(new RegExp(marks.outerOpening, 'g'), marks.innerOpening)
    .replace(new RegExp(marks.outerClosing, 'g'), marks.innerClosing)
  return marks.outerOpening + quotedStr + marks.outerClosing
}
