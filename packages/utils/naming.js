
const getName = ({ firstName, lastName }) =>
  [firstName, lastName]
    .filter(Boolean)
    .map(p => p.trim())
    .join(' ')

const getInitials = (name) => name
  .split(' ')
  .map(p => p[0])
  .filter(Boolean)
  .map(p => p.trim())
  .map(p => `${p.toUpperCase()}.`)
  .join(' ')

module.exports = {
  getName,
  getInitials
}
