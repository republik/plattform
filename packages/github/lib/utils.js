const cleanName = string =>
  string
    .trim()
    .split('@')[0]
    .split('.')
    .map(part => part.trim())
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join(' ')

const gitAuthor = (user, date = new Date()) => {
  return {
    name: user.name || cleanName(user.email),
    email: user.email,
    date
  }
}

module.exports = {
  gitAuthor
}
