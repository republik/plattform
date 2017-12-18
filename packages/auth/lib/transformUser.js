const getName = user =>
  [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

module.exports = user => {
  const name = getName(user)
  return {
    // default public fields
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    name,
    // read access to roles is protected by a resolver function
    roles: user.roles || [],
    // use resolver functions to access _raw
    // and expose more fields according to custom logic
    _raw: user,
    // mv to publikator-backend?
    gitAuthor (date = new Date()) {
      return {
        name,
        email: user.email,
        date
      }
    }
  }
}
