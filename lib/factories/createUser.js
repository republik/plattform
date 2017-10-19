const cleanName = string =>
  string
    .trim()
    .split('@')[0]
    .replace(/\s*\.\s*/, ' ')
    .split(' ')
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join(' ')

const getInitials = name =>
  name
    .split(' ')
    .map(p => p[0])
    .join('')

const getName = user =>
  [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

module.exports = user => {
  let name = getName(user)
  return {
    ...user,
    name: name || cleanName(user.email),
    initials: () => getInitials(name),
    roles: user.roles || []
  }
}
