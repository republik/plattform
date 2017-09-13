const name = (user) => {
  return [
    user.firstName,
    user.lastName
  ].filter(Boolean).join(' ')
}

module.exports = user => ({
  ...user,
  roles: user.roles || [ ],
  name () {
    return name(user)
  },
  gitAuthor (date = new Date()) {
    return {
      name: name(user),
      email: user.email,
      date
    }
  }
})
