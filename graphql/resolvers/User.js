module.exports = {
  name (user) {
    return [user.firstName, user.lastName].join(' ')
  }
}
