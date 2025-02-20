
exports.age = (birthyear) => {
  if (typeof birthyear !== 'number') {
    throw new TypeError(`birthyear ${birthyear} is excepted to be a number`)
  }
  const currentYear = new Date().getFullYear()
  const approxAge = currentYear - birthyear
  return approxAge
}
