const { naming } = require('@orbiting/backend-modules-utils')

const excludeLastNames = ['weiss']

// regex matches if character is not:
// a letter of any category/alphebet (unicode),
// a mark of any category,
// a whitespace character or
// one of the following special characters
// U+0027 --> ' Apostrophe
// U+002D --> - Hyphen-minus
// U+002E --> . Full stop
// U+2013 - U+2019 --> Dashes and single quotation marks
// U+2032 --> ′ Prime

// https://unicode-table.com/en/
const nameRegex = new RegExp(
  /[^\p{L}\p{M}\s\u0027\u002D\u002E\u2013-\u2019\u2032]/gu,
)

const cleanName = (name) => name.trim().replace(nameRegex, '')

const transformName = (u) => {
  const firstName = cleanName(u.firstName)
  const lastName = cleanName(u.lastName)
  const name = naming.getName({ firstName, lastName })
  return {
    firstName,
    lastName,
    name,
    initials: naming.getInitials(name),
    lastNameShort: lastName ? `${lastName[0].toUpperCase()}` : null,
  }
}

const clipNamesInText = (namesToClip, text) => {
  if (!namesToClip || !namesToClip.length || !text || !text.length) {
    return text
  }
  let newText = `${text}`
  namesToClip.forEach((n) => {
    try {
      newText = newText.replace(new RegExp(n.name, 'gmi'), n.initials)
    } catch (e) {}
    if (
      n.lastName &&
      n.lastName.length > 3 &&
      !excludeLastNames.includes(n.lastName.toLowerCase())
    ) {
      try {
        newText = newText.replace(
          new RegExp(`(^|[^\\S\\r\\n]+)(${n.lastName}s?)(\\W|_|$)`, 'gmi'),
          (match, p1 = '', p2, p3 = '') =>
            `${p1}${n.lastNameShort}${p3 !== '.' ? '.' : ''}${p3}`,
        )
      } catch (e) {}
    }
  })
  return newText
}

module.exports = {
  transformName,
  clipNamesInText,
}
