const { naming } = require('@orbiting/backend-modules-utils')

const excludeLastNames = ['weiss']

// https://unicode-table.com/en/
const nameRegex = () => new RegExp(/[^ \u0041-\u007a\u00c0-\u00ff\u0100-\u017F\u0180-\u024F\u0250-\u02AF\u0370-\u03FF\u0400-\u04FF\u0400-\u04FF\u1E00-\u1EFF]/g)

const cleanName = (name) =>
  name
    .trim()
    .replace(nameRegex(), '')

const transformName = (u) => {
  const firstName = cleanName(u.firstName)
  const lastName = cleanName(u.lastName)
  const name = naming.getName({ firstName, lastName })
  return {
    firstName,
    lastName,
    name,
    initials: naming.getInitials(name),
    lastNameShort: lastName ? `${lastName[0].toUpperCase()}` : null
  }
}

const clipNamesInText = (namesToClip, text) => {
  if (!namesToClip || !namesToClip.length || !text || !text.length) {
    return text
  }
  let newText = `${text}`
  namesToClip.forEach(n => {
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
            `${p1}${n.lastNameShort}${p3 !== '.' ? '.' : ''}${p3}`
        )
      } catch (e) {}
    }
  })
  return newText
}

module.exports = {
  transformName,
  clipNamesInText
}
