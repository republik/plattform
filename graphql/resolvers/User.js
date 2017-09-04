module.exports = {
  name (user) {
    return [user.firstName, user.lastName].join(' ')
  },
  roles (user) {
    if (!user.roles) {
      return []
    }
    return user.roles
  }
}
