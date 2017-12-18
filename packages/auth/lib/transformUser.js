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
    // use resolver functions to access _data
    // and expose more fields according to custom logic
    _data: user,
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
