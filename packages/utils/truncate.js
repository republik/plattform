module.exports = (input, n) => {
  if (!input || !n || input.length < n) {
    return input
  }
  let newString = input.substr(0, n)
  const lastSpaceIndex = newString.lastIndexOf(' ')
  if (lastSpaceIndex > 0) {
    newString = newString.substr(0, lastSpaceIndex)
  }
  return `${newString.trim()}...`
}
