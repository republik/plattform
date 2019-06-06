const { naming } = require('@orbiting/backend-modules-utils')

const excludeLastNames = ['weiss']

const transformName = (u) => {
  const name = naming.getName(u)
  return {
    ...u,
    name,
    initials: naming.getInitials(name),
    lastNameShort: `${u.lastName[0].toUpperCase()}`
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
    if (n.lastName.length > 3 && !excludeLastNames.includes(n.lastName.toLowerCase())) {
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
