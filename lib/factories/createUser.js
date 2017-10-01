module.exports = user => ({
  ...user,
  roles: user.roles || [ ],
  name () {
    return [
      user.firstName,
      user.lastName
    ].filter(Boolean).join(' ')
  }
})
