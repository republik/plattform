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

module.exports = async (_, args, { user, pgdb }) => {
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
    /* async address(user, args, { pgdb }) {
      if (!user.addressId) return null
      return pgdb.public.addresses.findOne({ id: user.addressId })
    }, */
    address: await pgdb.public.addresses.findOne({ id: user.addressId }),
    initials: () => getInitials(name),
    publicUser: {...user, name}
    // TODO: Implement memberships
    // TODO: Implement pledges
    // TODO: Implement testimonial
  }
}
