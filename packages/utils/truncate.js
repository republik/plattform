module.exports = (input, n) => {
  if (!input || !n || input.length < n) {
    return input
  }
  let newString = input.substr(0, n)
  const lastSpace = newString.lastIndexOf(' ')
  if (lastSpace > 0) {
    newString = newString.substr(0, newString.lastIndexOf(' '))
  }
  return `${newString.trim()}...`
}
