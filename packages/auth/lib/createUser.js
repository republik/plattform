const getName = (user) =>
  [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

const cleanName = string =>
  string
    .trim()
    .split('@')[0]
    .replace(/\s*\.\s*/, ' ')
    .split(' ')
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join(' ')

module.exports = user => {
  const name = getName(user)
  return {
    ...user,
    name: name || cleanName(user.email),
    roles: user.roles || [ ],
    gitAuthor (date = new Date()) {
      return {
        name,
        email: user.email,
        date
      }
    }
  }
}
