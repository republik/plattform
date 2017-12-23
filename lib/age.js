const { timeYear } = require('d3-time')

exports.age = dateOfBirth => {
  const now = new Date()
  let age = timeYear.count(dateOfBirth, now)
  var months = now.getMonth() - dateOfBirth.getMonth()
  if (months < 0 || (months === 0 && now.getDate() < dateOfBirth.getDate())) {
    age -= 1
  }
  return age
}
