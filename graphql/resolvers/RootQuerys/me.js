const cleanName = string => (
  string
    .trim()
    .split('@')[0]
    .replace(/\s*\.\s*/, ' ')
    .split(' ')
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join(' ')
)

const getInitials = name => (
  name
    .split(' ')
    .map(p => p[0])
    .join('')
)

module.exports = async (_, args, { user }) => {
  if (!user) {
    return user
  }

  let name = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  name = name || cleanName(user.email)

  return {
    ...user,
    name,
    initials: () => getInitials(name)
  }
}
